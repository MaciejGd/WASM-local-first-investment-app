#pragma once

#include <stdexcept>
#include <sstream>

#define CHECK_VALUES_EQUAL(n, m) linalg::utils::CheckEqual(n, m, __FILE_NAME__, __LINE__);
#define CHECK_OUT_OF_RANGE(n, range) linalg::utils::CheckOutOfRange(n, range, __FILE_NAME__, __LINE__);


namespace linalg::utils {

/// @brief MAXIMUM acceptable difference between floating point numbers
static constexpr int32_t MAX_ULPS = 10;

template<typename T>
void CheckEqual(const T& n, const T& m, const char* filename, int line) {
    std::stringstream ss;
    ss << "Invalid dimensions specified in: " << filename << " in line: " << line;
    if (n != m) {
        throw std::logic_error(ss.str().c_str());
    }
}

template<typename T, typename N>
void CheckOutOfRange(const T& n, const N& range, const char* filename, int line) {
    std::stringstream ss;
    ss << "Requested num: " << n << " out of range: " << range << ": " << filename << " in line: " << line;
    if (n > range) {
        throw std::out_of_range(ss.str().c_str());
    }
}

/// @brief We need custom compare operator for different datatypes
/// @tparam T type of the values to be compared
/// @param A first value
/// @param B second value
template<typename T>
bool CompareOperator(const T& A, const T& B) {
    return A == B;
}

template<>
bool CompareOperator(const float& A, const float& B) {
    if (sizeof(float) != sizeof(int32_t)) {
        std::runtime_error("Cannot compare floats using integers!");
    }

    if (A == B) return true;
    int32_t int_diff = std::abs(*(int32_t*)&A - *(int32_t*)&B);
    if (int_diff <= MAX_ULPS) {
        return true;
    }

    return false;
}

template<>
bool CompareOperator(const double& A, const double& B) {
    if (sizeof(float) != sizeof(int64_t)) {
        std::runtime_error("Cannot compare dobules using integers!");
    }

    if (A == B) return true;
    int64_t int_diff = std::abs(*(int64_t*)&A - *(int64_t*)&B);
    if (int_diff <= MAX_ULPS) {
        return true;
    }

    return false;
}

};