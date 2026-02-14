#include <iostream>
#include "./test_source/tests_runner.h"
#include "./inc/matrix_tests.h"
#include "./inc/algos_tests.h"

int main() {
    utests::UnitTestRunner::RunTests();
    return 0;
}


