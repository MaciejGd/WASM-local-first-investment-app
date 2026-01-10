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

    virtual void Run(TestResultContainer& res) = 0;
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
        const auto& testname = test_ptr->GetTestName();
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
        for (const auto& testsuite : test_map) {
            for (auto& test : testsuite.second) {
                utests::Test::TestResultContainer res;
                test->Run(res);
                if (!res.value) {
                    std::cout << "Testcase " << test->GetTestsuite() << ":" << test->GetTestName() << " failed!\n";
                }
                else {
                    std::cout << "Testcase " << test->GetTestsuite() << ":" << test->GetTestName() << " passed!\n";
                }
            }
        }
    };

private:
    /// @brief Private constructor
    UnitTestRunner() {};
    static UnitTestRunner* instance;

    // map of string to vector of Tests
    inline static std::map<std::string, std::vector<std::unique_ptr<Test>>> test_map;
};


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
        void test_suite##_##test_name##_Test::Run(utests::Test::TestResultContainer& res)

};

/// @brief Use for integers
#define CHECK_EQUAL(a,b)\
    if (a != b) res.value = false; return;

/// @brief Use for floating point numbers
#define CHECK_NEAR(a,b)\
    if (a - b <= -0.000001 || a - b >= 0.000001) res.value = false; return;
    

