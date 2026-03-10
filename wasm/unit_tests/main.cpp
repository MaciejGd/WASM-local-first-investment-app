#include <iostream>
#include "./test_source/tests_runner.h"
#include "./inc/matrix_tests.h"
#include "./inc/algos_tests.h"
#include "./inc/utils_test.h"
#include "./inc/finance_api_tests.h"
#include "./inc/random_gen_tests.h"
#include "./inc/sims_results_tests.h"

int main() {
    utests::UnitTestRunner::RunTests();
    return 0;
}


