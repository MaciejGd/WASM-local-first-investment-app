#include <iostream>
#include "../inc/matrix.h"




int main() {
    Matrix<int> test(2,2);
    Matrix<float> test1(2,2);
    auto test3 = test * test1;
    return 0;   
}