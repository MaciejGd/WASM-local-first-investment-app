#include <iostream>
#include "./test_source/tests_runner.h"
#include "./inc/matrix_tests.h"
#include "./inc/algos_tests.h"
#include "./inc/utils_test.h"

int main() {
    utests::UnitTestRunner::RunTests();
    return 0;
}


