#include <iostream>
#include "../inc/matrix.h"

using std::vector;
using namespace linalg::primitives;

template<typename T>
void printCMatrix(const CMatrix<T>& mat) {
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

int main() {
    vector<vector<int>> mat = {
        {1, 3, 1, 7},
        {3, 5, 6, 1},
        {5, 2, 1, 5},
        {5, 2, 1, 5}
    };
    vector<vector<int>> mat2 = {
        {4, 6, 4, 10},
        {6, 8, 9, 4},
        {8, 5, 4, 8},
        {8, 5, 4, 8}
    };
    vector<float> vec = {3, 2, 1};
    CMatrix matrix1(mat);
    CMatrix matrix2(mat2);
    CMatrix matrix3(vec);
    auto matrix4 = matrix1 * matrix2;
    printCMatrix(matrix4);
    auto matrix6 = matrix1 - matrix2;
    printCMatrix(matrix6);
    return 0;   
}