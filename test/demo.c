/*
 preview_test.cpp
 A single-file C++ preview/test utility to compile and run quickly.

 Features:
 - Prints header with version and timestamp
 - Runs a few small "preview" checks: factorial, prime check, sort sample, simple I/O echo
 - Accepts an optional argument: --cases N to run N randomized small tests
 - Meant for quick compile + run while testing toolchains / CI previews

 Compile:
   g++ -std=c++17 preview_test.cpp -O2 -o preview_test
 Run:
   ./preview_test
   ./preview_test --cases 5
*/

#include <bits/stdc++.h>
using namespace std;
using ll = long long;

// simple factorial (iterative, safe for small n)
unsigned long long factorial(int n) {
    unsigned long long res = 1;
    for (int i = 2; i <= n; ++i) res *= i;
    return res;
}

bool is_prime(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0) return false;
    for (int i = 3; (long long)i * i <= n; i += 2)
        if (n % i == 0) return false;
    return true;
}

void print_header() {
    auto t = chrono::system_clock::to_time_t(chrono::system_clock::now());
    cout << "=== Preview Test: preview_test.cpp ===\n";
    cout << "Build