#include <iostream>
#include "../inc/matrix.h"
#include "../inc/matrix_special.h"

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
    // vector<vector<int>> mat = {
    //     {1, 3, 1, 7},
    //     {3, 5, 6, 1},
    //     {5, 2, 1, 5}
    // };
    // vector<vector<int>> mat2 = {
    //     {4, 6, 4},
    //     {6, 8, 9},
    //     {8, 5, 4},
    //     {8, 5, 4}
    // };
    CMatrixLowTriangular tri2(mat2);
    printCMatrix(tri2);
    
    CMatrixUpperTriangle tri(mat2);
    printCMatrix(tri);

    CMatrix matrix1(mat);
    CMatrix out = tri * matrix1;
    std::cout << "Print output matrix\n";
    printCMatrix(out);
    return 0;   
}