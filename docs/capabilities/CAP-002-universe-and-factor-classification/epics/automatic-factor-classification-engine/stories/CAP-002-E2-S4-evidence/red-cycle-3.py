"""RED evidence for CAP-002-E2-S4 cycle-3 (rework of implementation review v2).

The cycle is test-only: src is HEAD's. Runs tests/integration/test_engine_inputs_momentum.py
in scratch copies of the component, never in the working tree, each copy imported first
through PYTHONPATH:

  A  HEAD's src and HEAD's tests, with review v2's survivor review2-known-on-outdated-e
     applied: the survivor is reproduced (the module passes).
  B  HEAD's src and the cycle's tests, with the survivor applied: only the cycle's new test
     fails (RED against the mutant).
  C  HEAD's src and the cycle's tests, unmutated: the module passes (control).

Usage: python red-cycle-3.py <component repo> <review mutation json> <scratch dir> <log>
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
SURVIVOR = "manual:review2-known-on-outdated-e"
PYTHON = os.path.join(REPO, ".venv", "bin", "python")


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def head_tree(target):
    os.makedirs(target)
    archive = subprocess.run(["git", "-C", REPO, "archive", "HEAD", "src", "tests",
                              "pyproject.toml"], capture_output=True, check=True).stdout
    subprocess.run(["tar", "-x", "-C", target], input=archive, check=True)


def with_cycle_tests(source, target):
    shutil.copytree(source, target, ignore=shutil.ignore_patterns("__pycache__"))
    shutil.copy(os.path.join(REPO, TESTS), os.path.join(target, TESTS))


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
    mutant = {m["id"]: m for m in json.load(open(REVIEW))["mutants"]}[SURVIVOR]
    shutil.rmtree(SCRATCH, ignore_errors=True)
    os.makedirs(SCRATCH)
    head = os.path.join(SCRATCH, "head")
    head_tree(head)

    a = os.path.join(SCRATCH, "A")
    shutil.copytree(head, a)
    apply(a, mutant)
    b = os.path.join(SCRATCH, "B")
    with_cycle_tests(head, b)
    apply(b, mutant)
    c = os.path.join(SCRATCH, "C")
    with_cycle_tests(head, c)
    jobs = [("A  HEAD src + HEAD tests + %s" % SURVIVOR, a),
            ("B  HEAD src + cycle-3 tests + %s" % SURVIVOR, b),
            ("C  HEAD src + cycle-3 tests, unmutated", c)]

    with concurrent.futures.ThreadPoolExecutor(3) as pool:
        results = list(pool.map(lambda job: pytest(*job), jobs))

    with open(LOG, "w", encoding="utf-8") as log:
        log.write("# RED evidence, CAP-002-E2-S4 cycle-3 (review v2 rework, test-only)\n")
        log.write("# HEAD %s\n" % subprocess.run(["git", "-C", REPO, "rev-parse", "HEAD"],
                                                 capture_output=True, text=True).stdout.strip())
        log.write("# HEAD %s sha256 %s (the cycle does not change it)\n"
                  % (SQL, sha(os.path.join(head, SQL))))
        log.write("# HEAD %s sha256 %s\n" % (TESTS, sha(os.path.join(head, TESTS))))
        log.write("# cycle-3 %s sha256 %s\n" % (TESTS, sha(os.path.join(c, TESTS))))
        log.write("# review mutants: %s sha256 %s\n" % (os.path.basename(REVIEW), sha(REVIEW)))
        log.write("# mutant %s at %s:%s\n#   old: %s\n#   new: %s\n"
                  % (SURVIVOR, mutant["file"], mutant["line"], mutant["old"], mutant["new"]))
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
