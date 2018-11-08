#! /usr/bin/env ruby

=begin 

Gapful Numbers

A gapful number is a number of at least 3 digits that is divisible by the
number formed by the first and last digit of the original number.

For Example:
Input: 192
Output: true (192 is gapful because it is divisible 12)

Input: 583
Output: true (583 is gapful because it is divisible by 53)

Input: 210
Output: false (210 is not gapful because it is not divisible by 20)

Write a program to check if the user input is a gapful number or not.

    NOTE
    
    I really hate interractive programs in SL, this one generates a
    random pair of numbers and finds all valid gapful entries.

=end

hi = 1 + rand(9);
lo = 1 + rand(9);

div = hi * 10 + lo;
mid = 0;
pow = 10;
count = 0;

while count < 1000 do

  num = hi * pow * 10 + mid * 10 + lo;

  if (num % div) == 0
    res = num / div;
    printf "%d = %d * %d\n", num, div, res;
    count += 1;
  end

  mid += 1;
  pow *= 10 if mid >= pow;

end
