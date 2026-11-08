import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  createContext,
  forwardRef,
  useContext,
  useId,
} from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { cn } from "./utils";

/**
 * Vendored shadcn/ui `form` on `react-hook-form` (component design 2.1) with the
 * `stacked` and `inline` variants on a new `FormRoot` (DEC-0300).
 *
 * Create the form with `useForm({ resolver: zodResolver(schema), mode:
 * "onTouched" })`: a field then validates when it loses focus and re-validates
 * on every change once it is in error (form spec section 4, input spec section
 * 4). `FormRoot` sets `noValidate` so the resolver, not the browser's own
 * bubbles, reports every error at once, and react-hook-form moves focus to the
 * first field in error.
 *
 * `FormControl` wires the control it wraps: its `id`, an `aria-labelledby`
 * naming the `FormLabel` (which also names a control that a `label` cannot,
 * such as a radio group, and lets an `Input` suffix join the name; DEC-0299),
 * an `aria-describedby` listing the hint and, in error, the message, and
 * `aria-invalid`. `FormMessage` is `role="alert"` while it shows an error so
 * the error is announced when it appears after the field has lost focus
 * (DAC-E1-S2-2). A prop the caller sets on the wrapped control replaces the one
 * `FormControl` supplies, so put an extra description inside `FormDescription`
 * instead of overriding `aria-describedby`.
 */
export const Form = FormProvider;

const formRootVariants = cva("", {
  variants: {
    variant: {
      stacked: "flex flex-col gap-4",
      inline: "flex flex-row flex-wrap items-end gap-3",
    },
  },
  defaultVariants: { variant: "stacked" },
});

export interface FormRootProps
  extends HTMLAttributes<HTMLFormElement>,
    VariantProps<typeof formRootVariants> {}

export const FormRoot = forwardRef<HTMLFormElement, FormRootProps>(
  ({ className, variant = "stacked", ...props }, ref) => (
    <form
      ref={ref}
      noValidate
      data-variant={variant}
      className={cn(formRootVariants({ variant }), className)}
      {...props}
    />
  ),
);
FormRoot.displayName = "FormRoot";

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue);

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

interface FormItemContextValue {
  id: string;
}

const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

export const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext.name) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formLabelId: `${id}-form-item-label`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

export const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = useId();
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

export const FormLabel = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId, formLabelId } = useFormField();
  return (
    <LabelPrimitive.Root
      ref={ref}
      id={formLabelId}
      className={cn(
        "text-base font-medium text-foreground",
        error && "text-destructive",
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

export const FormControl = forwardRef<
  ElementRef<typeof Slot>,
  ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formLabelId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-labelledby={formLabelId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

export const FormDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

export const FormMessage = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error.message ?? "") : children;
    if (!body) {
      return null;
    }
    return (
      <p
        ref={ref}
        id={formMessageId}
        role={error ? "alert" : undefined}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {body}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";
