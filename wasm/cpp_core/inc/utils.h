#pragma once

#include <stdexcept>
#include <sstream>

#define CHECK_EQUAL(n, m) CheckEqual(n, m, __FILE_NAME__, __LINE__);
#define CHECK_OUT_OF_RANGE(n, range) CheckOutOfRange(n, range, __FILE_NAME__, __LINE__);

template<typename T>
void CheckEqual(const T& n, const T& m, const char* filename, int line) {
    std::stringstream ss;
    ss << "Invalid dimensions specified in: " << filename << " in line: " << line;
    if (n != m) {
        throw std::runtime_error(ss.str().c_str());
    }
}

template<typename T, typename N>
void CheckOutOfRange(const T& n, const N& range, const char* filename, int line) {
    std::stringstream ss;
    ss << "Requested num: " << n << " out of range: " << range << ": " << filename << " in line: " << line;
    if (n >= range) {
        throw std::runtime_error(ss.str().c_str());
    }
}