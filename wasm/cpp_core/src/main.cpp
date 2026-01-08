#include <iostream>
#include "../inc/matrix.h"
#include "../inc/matrix_special.h"
#include "../inc/algorithms.h"
#include <assert.h>

#include <deque>
#include <set>


using std::vector;
using namespace linalg::primitives;

template<typename T>
void printCMatrix(const CMatrix<T>& mat, std::string msg = "") {
    std::cout << ((msg != "") ? msg + "\n" : "");
    std::cout << " +-"; 
    for (uint32_t j = 0; j < mat.cols(); j++) {
        std::cout << "-" << "-+-";
    }
    std::cout << "-+\n";
    for (uint32_t i = 0; i < mat.rows(); i++) {
        std::cout << " | ";
        for (uint32_t j = 0; j < mat.cols(); j++) {
            std::cout << mat.at(i,j) << " | ";
        }
        std::cout << "\n";
    }
    std::cout << " +-"; 
    for (uint32_t j = 0; j < mat.cols(); j++) {
        std::cout << "-" << "-+-";
    }
    std::cout << "\n";
}

void CholeskyTest() {
    using namespace linalg::algorithms;
    CMatrix<int> mat({{25, 15, -5}, 
                      {15, 18, 0}, 
                      {-5,  0, 11}});
    auto res = CholeskyFactorization(mat);
    printCMatrix(res, "Cholesky for first: ");
    CMatrix<float> mat1({{6, 2, 1, 1}, 
                         {2, 5, 2, 1}, 
                         {1, 2, 4, 1}, 
                         {1, 1, 1, 3}});
    auto res1 = CholeskyFactorization(mat1);
    printCMatrix(res1, "Cholesky for second: ");
    CMatrix<float> mat2({{10, 2, 3, 1, 2}, 
                         { 2, 9, 1, 2, 1}, 
                         { 3, 1, 8, 2, 1}, 
                         { 1, 2, 2, 7, 1},
                         { 2, 1, 1, 1, 6}});
    auto res2 = CholeskyFactorization(mat2);
    printCMatrix(res2, "Cholesky for third: ");
}

#define FLOATS_EQUAL(a, b) {\
    std::cout << "Comparing " << a << " and " << b << "\n"; \
    assert( std::abs(a - b) < 0.000001 ); \
}

void MeanTest() {
    using namespace linalg::algorithms;
    std::vector<int> v{1,2,3};
    auto res = Mean(v);
    FLOATS_EQUAL(res, 2);

    std::set<long long> s;
    s.insert(321LL);
    s.insert(21LL);
    s.insert(621LL);
    auto res1 = Mean(s);
    FLOATS_EQUAL(res1, 321);

    std::deque<float> d{3222.23, 32.9, 943.4};
    auto res2 = Mean(d);
    //FLOATS_EQUAL(res2, 1339.51);

    std::array<float, 3> a = {14, 1.9, 32.12};
    auto res3 = Mean(a);
    FLOATS_EQUAL(res3, 16.00666666);
    

    int* arr = new int[4];
    arr[0] = 1;
    arr[1] = 2;
    arr[2] = 3;
    arr[3] = 4;
    auto res4 = Mean(arr, 4);
    FLOATS_EQUAL(res4, 2.5);
    

}

int main() {
    vector<vector<int>> mat = {
        {1, 3, 1, 7, 7, 7},
        {3, 5, 6, 1, 1, 1},
        {5, 2, 1, 5, 5, 5}
    };
    vector<vector<int>> mat2 = {
        {4, 6, 4},
        {6, 8, 9},
        {8, 5, 4},
        {8, 5, 4},
        {8, 5, 4},
        {8, 5, 4}
    };
    CholeskyTest();
    MeanTest();
    return 0;   
}