func fizzbuzz(count) {
    for (let i = 1; i <= count; i = i + 1) {
        if (i % 15 == 0) {
            print "FizzBuzz";
        } else if (i % 3 == 0) {
            print "Fizz";
        } else if (i % 5 == 0) {
            print "Buzz";
        } else {
            print i;
        }
    }
}

fizzbuzz(30);