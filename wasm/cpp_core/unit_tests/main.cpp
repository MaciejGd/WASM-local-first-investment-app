#include <iostream>
#include "./inc/tests_runner.h"

#define TEST_FAIL()\
    res.value = false;\
    return;\


//using namespace unit_tests;
UNIT_TEST(Testsuite, testing1) 
{
    CHECK_NEAR(1.0000001, 1.0000002);
}

//using namespace unit_tests;
UNIT_TEST(Testsuite, testing2) 
{
    CHECK_NEAR(1.0001, 1.020);
}

int main() {
    utests::UnitTestRunner::RunTests();
    return 0;
}


