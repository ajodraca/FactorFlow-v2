"""RED evidence for CAP-002-E2-S4 cycle-2 (rework of implementation review v1).

Runs tests/integration/test_engine_inputs_momentum.py in scratch copies of the component,
never in the working tree, each copy imported first through PYTHONPATH:

  A  HEAD's src and HEAD's tests, with each of review v1's 8 non-equivalent survivors applied:
     the survivors are reproduced (the module passes).
  B1 HEAD's src and the cycle's tests: the DEC-0242 and DEC-0243 assertions fail on the
     production code before this cycle's change (behaviour RED).
  B2 The cycle's src and tests, with each survivor applied: each fails a test this cycle wrote.
  C  The cycle's src and tests, unmutated: the module passes (control).

Usage: python red-cycle-2.py <component repo> <review mutation json> <scratch dir> <log>
"""

import concurrent.futures
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys

REPO, REVIEW, SCRATCH, LOG = sys.argv[1:5]
SQL = "src/factorflow/classification/sql/momentum_inputs.sql"
TESTS = "tests/integration/test_engine_inputs_momentum.py"
SURVIVORS = [
    "manual:review-split-set-any-instrument",
    "manual:review-prior-any-instrument",
    "manual:review-known-on-prior-min",
    "manual:review-close-factor-max",
    "manual:review-cash-factor-max",
    "manual:review-unusable-bool-and",
    "manual:review-cash-regex-allows-plus",
    "manual:review-non-positive-ignores-unusable",
]
PYTHON = os.path.join(REPO, ".venv", "bin", "python")


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def head_tree(target):
    os.makedirs(target)
    archive = subprocess.run(["git", "-C", REPO, "archive", "HEAD", "src", "tests",
                              "pyproject.toml"], capture_output=True, check=True).stdout
    subprocess.run(["tar", "-x", "-C", target], input=archive, check=True)


def copy_tree(source, target, src_from=None):
    shutil.copytree(source, target, ignore=shutil.ignore_patterns("__pycache__"))
    if src_from:
        shutil.rmtree(os.path.join(target, "src"))
        shutil.copytree(os.path.join(src_from, "src"), os.path.join(target, "src"),
                        ignore=shutil.ignore_patterns("__pycache__"))


def apply(target, mutant):
    path = os.path.join(target, mutant["file"])
    text = open(path, encoding="utf-8").read()
    assert text.count(mutant["old"]) == 1, mutant["id"]
    open(path, "w", encoding="utf-8").write(text.replace(mutant["old"], mutant["new"]))


def pytest(label, target):
    command = [PYTHON, "-B", "-m", "pytest", "-m", "postgres or not postgres", "-q",
               "-p", "no:cacheprovider", "-rf", "--tb=no", TESTS]
    env = dict(os.environ, PYTHONPATH=os.path.join(target, "src"))
    done = subprocess.run(command, cwd=target, env=env, capture_output=True, text=True)
    out = done.stdout + done.stderr
    failed = sorted(re.findall(r"^FAILED (.+?)(?: - .*)?$", out, re.M))
    summary = [line for line in out.splitlines() if re.search(r"\d+ (passed|failed)", line)]
    return {"label": label, "exit": done.returncode, "failed": failed,
            "summary": summary[-1] if summary else out[-400:]}


def main():
    mutants = {m["id"]: m for m in json.load(open(REVIEW))["mutants"]}
    shutil.rmtree(SCRATCH, ignore_errors=True)
    os.makedirs(SCRATCH)
    head = os.path.join(SCRATCH, "head")
    head_tree(head)
    cycle = os.path.join(SCRATCH, "cycle")
    os.makedirs(cycle)
    for part in ("src", "tests"):
        shutil.copytree(os.path.join(REPO, part), os.path.join(cycle, part),
                        ignore=shutil.ignore_patterns("__pycache__"))
    shutil.copy(os.path.join(REPO, "pyproject.toml"), cycle)

    jobs = []
    for index, name in enumerate(SURVIVORS):
        a = os.path.join(SCRATCH, "A%d" % index)
        copy_tree(head, a)
        apply(a, mutants[name])
        jobs.append(("A  HEAD src + HEAD tests + %s" % name, a))
    b1 = os.path.join(SCRATCH, "B1")
    copy_tree(cycle, b1, src_from=head)
    jobs.append(("B1 HEAD src + cycle-2 tests", b1))
    for index, name in enumerate(SURVIVORS):
        b2 = os.path.join(SCRATCH, "B2-%d" % index)
        copy_tree(cycle, b2)
        apply(b2, mutants[name])
        jobs.append(("B2 cycle-2 src + cycle-2 tests + %s" % name, b2))
    jobs.append(("C  cycle-2 src + cycle-2 tests, unmutated", cycle))

    with concurrent.futures.ThreadPoolExecutor(4) as pool:
        results = list(pool.map(lambda job: pytest(*job), jobs))

    with open(LOG, "w", encoding="utf-8") as log:
        log.write("# RED evidence, CAP-002-E2-S4 cycle-2 (review v1 rework)\n")
        log.write("# HEAD %s\n" % subprocess.run(["git", "-C", REPO, "rev-parse", "HEAD"],
                                                 capture_output=True, text=True).stdout.strip())
        log.write("# HEAD %s sha256 %s\n" % (SQL, sha(os.path.join(head, SQL))))
        log.write("# cycle-2 %s sha256 %s\n" % (SQL, sha(os.path.join(cycle, SQL))))
        log.write("# HEAD %s sha256 %s\n" % (TESTS, sha(os.path.join(head, TESTS))))
        log.write("# cycle-2 %s sha256 %s\n" % (TESTS, sha(os.path.join(cycle, TESTS))))
        log.write("# review mutants: %s sha256 %s\n" % (os.path.basename(REVIEW), sha(REVIEW)))
        log.write("# command per copy: python -B -m pytest -m 'postgres or not postgres' -q "
                  "-p no:cacheprovider -rf --tb=no %s, PYTHONPATH=<copy>/src\n\n" % TESTS)
        for result in results:
            log.write("== %s\n   exit %d: %s\n" % (result["label"], result["exit"],
                                                  result["summary"]))
            for test in result["failed"]:
                log.write("   FAILED %s\n" % test)
            log.write("\n")
    for result in results:
        print(result["exit"], result["label"], result["summary"], len(result["failed"]))


if __name__ == "__main__":
    main()
