#pragma once

#include <string>
#include <iostream>
#include <vector>
#include <map>
#include <memory>
#include <algorithm>


using std::vector;
using std::string;

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
    Test(Test&& other) = default;
    Test& operator=(Test&& other) = default;
    
    void registerTest() {};
    // TODO, run test
    void Run() {};

    constexpr const std::string& GetTestsuite() const { return info.GetTestSuite(); }
    constexpr const std::string& GetTestName() const { return info.GetTestName(); }

    virtual void TestBody() {};
protected:
    TestInfo info;
};


/// @brief Main testrunner Singleton class
class UnitTestRunner {
public:
    static UnitTestRunner* GetInstance() {
        if (!instance) {
            instance = new UnitTestRunner{};
        }
        return instance;
    };

    /// @brief Register testcase for running
    /// @param test_ptr unique_ptr to the testclass
    /// @return bool, true on success, false otherwise
    static bool RegisterTest(std::unique_ptr<Test> test_ptr) {
        const auto& testsuite = test_ptr->GetTestsuite();
        const auto& testname = test_ptr->GetTestName();
        // if testsuite not registered yet, register it and add test to container
        if (test_map.find(testsuite) == test_map.end()) {
            test_map[testsuite].push_back(std::move(test_ptr));
        }
        // if testsuite exists check if test already exists in the container
        const auto& testsuite_entry = test_map[testsuite];
        auto found_test = std::find_if(testsuite_entry.begin(), testsuite_entry.end(), [testname](const auto& a) {
            return (a->GetTestName() == testname);
        });
        if (found_test != testsuite_entry.end()) {
            std::cout << "Test name: " << testname << " already added to the testsuite!\n";
            return false;
        }
        // if not found, append test to the testsuite container
        test_map[testsuite].push_back(std::move(test_ptr));
    };

    /// @brief Run all registered testcases
    static void RunTests() {
        for (const auto& testsuite : test_map) {
            for (auto& test : testsuite.second) {
                test->Run();
            }
        }
    };

private:
    /// @brief Private constructor
    UnitTestRunner() {};
    static UnitTestRunner* instance;

    // map of string to vector of Tests
    static std::map<std::string, std::vector<std::unique_ptr<Test>>> test_map;
};


#define UNIT_TEST(test_suite, test_name)\ 
        class test_suite##_##test_name##_Test : public Test {\
        public:\
            test_suite##_##test_name##_Test(): Test() {};\
            void TestBody() override {}; \
        };\

