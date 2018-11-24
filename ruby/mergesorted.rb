#! /usr/bin/env ruby


# Generate some random data instead of bugging the user for input

def show(arr, desc)
  printf "%20s:", desc;
  arr.each { |v| printf " %d", v }
  printf "\n";
end 

def gen()
  res = [];
  for n in 0..rand(5)+5 do
    res.push(rand(10));
  end
  res = res.sort();
  show(res, 'input array');
  return res;
end

a = gen();
b = gen();


# The big fat algorithm to merge sorted arrays

c = [];

while true do

  fa = a.first;
  fb = b.first;

  # Move smallest entry in output
  if (fa < fb)
    c.push(fa);
    a.shift();
  else
    c.push(fb);
    b.shift();
  end

  # Flush remaining ones
  if a.empty?
    c.concat(b);
    break;
  end

  if b.empty?
    c.concat(a);
    break;
  end

end

show(c, 'merged output');
