#pragma once

#include <string>
#include <iostream>
#include <vector>
#include <map>
#include <memory>
#include <algorithm>
#include <assert.h>
#include <sstream>

using std::vector;
using std::string;

namespace utests {

// LOGGING UTILITY

inline static constexpr const char* RED_TEXT_COLOR = "\033[31m";
inline static constexpr const char* GREEN_TEXT_COLOR = "\033[32m";
inline static constexpr const char* RESET_TEXT_COLOR = "\033[0m";
inline static constexpr const char* WHITE_BOLD_TEXT_COLOR = "\033[1;37m";
inline static constexpr const int INDENTATION = 60;


#define PRINT_BOLD(msg)\
    std::cout << WHITE_BOLD_TEXT_COLOR << msg << RESET_TEXT_COLOR;

#define LOG_FAIL(msg)\
    {\
        std::stringstream ss;\
        ss << utests::RED_TEXT_COLOR << msg << "FAILED" << utests::RESET_TEXT_COLOR << std::endl;\
        std::cout << ss.str();\
    }

#define LOG_PASS(msg);\
    {\
        std::stringstream ss;\
        ss << utests::GREEN_TEXT_COLOR << msg << "PASSED" << utests::RESET_TEXT_COLOR << std::endl;\
        std::cout << ss.str();\
    }

#define LOG_TEST_RESULT(testsuite, testname, result);\
    {\
        int spacing = utests::INDENTATION - (testsuite.size() + testname.size());\
        std::stringstream msg;\
        msg << testsuite << ":" << testname << std::string(spacing, ' ');\
        if (result) { LOG_PASS(msg.str()); }\
        else { LOG_FAIL(msg.str()); }\
    }\

#define TESTS_SUMMARIZE(testsuite, testnum, testpassed)\
    {\
        std::stringstream ss;\
        ss << testsuite << std::string(utests::INDENTATION - testsuite.size(), ' ') << testpassed << "/"\
            << testnum << " PASSED" << std::endl;\
        PRINT_BOLD(ss.str());\
    }

#define TESTSUITES_SEPARATION()\
    {\
        std::stringstream ss;\
        ss << std::string(utests::INDENTATION + 10, '*') << std::endl;\
        PRINT_BOLD(ss.str());\
    }

/// @brief Information about test, testsuite name and testname
class [[nodiscard]] TestInfo {
public:
    TestInfo() = default;
    TestInfo(const std::string& testsuite, const std::string& testname): 
                            m_testsuite(testsuite), m_testname(testname) {};

    constexpr const std::string& GetTestName() const { return m_testname; };
    constexpr const std::string& GetTestSuite() const { return m_testsuite; };    
private:
    std::string m_testsuite;
    std::string m_testname;

};

/// @brief Abstract class for each new test
class [[nodiscard]] Test {
public:
    Test(): info(TestInfo{"test", "test"}) {};
    Test(const std::string& testsuite, const std::string& testname): info(TestInfo{testsuite, testname}) {};
    Test(Test&& other) = default;
    Test& operator=(Test&& other) = default;
    
    constexpr const std::string& GetTestsuite() const { return info.GetTestSuite(); }
    constexpr const std::string& GetTestName() const { return info.GetTestName(); }

    /// @brief Object storing result of the test
    struct TestResultContainer {
        bool value = true;
    };

    virtual void Run(TestResultContainer& test_result_contianer) = 0;
protected:
    TestInfo info;
};

/// @brief Main testrunner Singleton class
class UnitTestRunner {
public:
    /// @brief Register testcase for running
    /// @param test_ptr unique_ptr to the testclass
    /// @return bool, true on success, false otherwise
    static bool RegisterTest(std::unique_ptr<Test> test_ptr) {
        const auto& testsuite = test_ptr->GetTestsuite();
        // if testsuite not registered yet, register it and add test to container
        if (test_map.find(testsuite) == test_map.end()) {
            test_map[testsuite].push_back(std::move(test_ptr));
            return true;
        }
        // if not found, append test to the testsuite container
        test_map[testsuite].push_back(std::move(test_ptr));
        return true;
    };

    /// @brief Run all registered testcases
    static void RunTests() {
        int tests_amount = 0;
        int all_passed_tests = 0;
        for (const auto& testsuite : test_map) {
            int tests_passed = 0;
            TESTSUITES_SEPARATION();
            for (auto& test : testsuite.second) {
                utests::Test::TestResultContainer res;
                test->Run(res);
                LOG_TEST_RESULT(test->GetTestsuite(), test->GetTestName(), res.value);
                if (res.value) tests_passed++;
            }
            TESTS_SUMMARIZE(testsuite.first, testsuite.second.size(), tests_passed);
            tests_amount += testsuite.second.size();
            all_passed_tests += tests_passed;
        }
        TESTS_SUMMARIZE(std::string("All tests run, results: "), tests_amount, all_passed_tests);
    };

private:
    /// @brief Private constructor
    UnitTestRunner() {};
    static UnitTestRunner* instance;

    // map of string to vector of Tests
    inline static std::map<std::string, std::vector<std::unique_ptr<Test>>> test_map;
};

/// Macro for instantiating unit tests. Each test from particular testsuite should have unique name
#define UNIT_TEST(test_suite, test_name)\
        class test_suite##_##test_name##_Test : public utests::Test {\
        public:\
            test_suite##_##test_name##_Test(): utests::Test(#test_suite, #test_name) {};\
            void Run(utests::Test::TestResultContainer& res) override; \
        };\
\
        static bool test_suite##_##test_name##_Test_registering_result = utests::UnitTestRunner::RegisterTest(\
            std::make_unique<test_suite##_##test_name##_Test>()\
        );\
\
        void test_suite##_##test_name##_Test::Run(utests::Test::TestResultContainer& test_result_contianer)

};

/// Action that should be taken on test fail
#define FAIL_TEST test_result_contianer.value = false; return;

/// Check if two values are equal
#define CHECK_EQUAL(a,b)\
    if (a != b) FAIL_TEST

/// Check if two values are not equal
#define CHECK_NOT_EQUAL(a,b)\
    if (a == b) FAIL_TEST

/// Check if value a is less or equal than b
#define CHECK_LE(a,b)\
    if (a > b) FAIL_TEST

/// Check if value a is strictly less than b
#define CHECK_L(a,b)\
    if (a >= b) FAIL_TEST

/// Check if value a is greater or equal than b
#define CHECK_GE(a,b)\
    if (a < b) FAIL_TEST

/// Check if value a is strictly greater than b
#define CHECK_G(a,b)\
    if (a <= b) FAIL_TEST


// TODO change that as it is not the best solution to check float values
#define CHECK_EQUAL_FLOAT(a,b)\
    if (a - b <= -0.000001 || a - b >= 0.000001) FAIL_TEST

/// Check if difference between two numbers is less or equal to 'near'
#define CHECK_NEAR(a,b,near)\
    if (a - b <= -near || a - b >= near) FAIL_TEST

/// Check if expression evaluates to true
#define CHECK_TRUE(a)\
    if (!a) FAIL_TEST
    
/// Check if expression evaluates to false
#define CHECK_FALSE(a)\
    if (a) FAIL_TEST



