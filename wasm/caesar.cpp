// caesar.cpp
// emscripten example
typedef long int i32;
typedef long long i64;
typedef double f64;
extern "C" {
  void caesarEncrypt(i32 *plaintext, i32 plaintextLength, i32 key) {
    for (int i = 0; i < plaintextLength; i++) {
      plaintext[i] = (plaintext[i] + key) % 26;
    }
  }
  void caesarDecrypt(i32 *ciphertext, i32 ciphertextLength, i32 key) {
    for (int i = 0; i < ciphertextLength; i++) {
      ciphertext[i] = (ciphertext[i] - key) % 26;
    }
  }
  // allocate extra memory for the application
  f64* alloc_f64(i32 size) {
    return new f64[size];
  }
  // deallocate extra memory for the application
  void dealloc_f64(f64* ptr) {
    delete[] ptr;
  }


  void double_check(f64* buff, i32 size, f64* res) {
    for (int i = 0; i < size; i++) {
      buff[i] += 2;
    }
    res[0] = 1;
    res[1] = 2; 
    res[2] = 3;
    res[3] = 4;
  }
}