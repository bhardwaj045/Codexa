/**
 * Official LeetCode Problem Specifications and Metadata
 * Provides exact LeetCode descriptions, examples, constraints, hints, starter code, solutions, and editorials.
 */

export const LEETCODE_PROBLEMS = {
  // 1. Two Sum (LeetCode #1)
  'two sum': {
    leetcodeNumber: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    topics: ['Array', 'Hash Table'],
    companies: ['Amazon', 'Google', 'Apple', 'Microsoft', 'Meta', 'Bloomberg'],
    acceptedCount: '24,198,988',
    totalSubmissionsCount: '41.6M',
    acceptanceRate: '58.2%',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        id: 1,
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        id: 2,
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        id: 3,
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    followUp: 'Can you come up with an algorithm that is less than O(n²) time complexity?',
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try out brute force solutions for completeness.',
      'So, if we check sub-array nums[i...n-1] for target - nums[i], we can use a hash map to reduce search time from O(n) to O(1).'
    ],
    similarQuestions: [
      { title: '3Sum', difficulty: 'Medium' },
      { title: '4Sum', difficulty: 'Medium' },
      { title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
      PYTHON: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        `,
      CPP: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = sc.nextInt();
        int[] ans = new Solution().twoSum(nums, target);
        System.out.println(ans[0] + " " + ans[1]);
    }
}`,
      PYTHON: `if __name__ == '__main__':
    lines = sys.stdin.read().strip().split('\n')
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split()))
        target = int(lines[1])
        ans = Solution().twoSum(nums, target)
        print(f"{ans[0]} {ans[1]}")`,
      CPP: `int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        int target;
        if (cin >> target) {
            Solution sol;
            vector<int> ans = sol.twoSum(nums, target);
            cout << ans[0] << " " << ans[1] << endl;
        }
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Approach 1: One-Pass Hash Table',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'While we iterate and insert elements into the hash table, we also look back to check if current element\'s complement already exists in the table. If it exists, we have found a solution and return immediately.'
      },
      {
        title: 'Approach 2: Brute Force',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        description: 'Loop through each element x and search if there is another value that equals to target - x. Check every combination of pairs.'
      }
    ],
    editorial: `The problem can be solved in a single pass. For each element, we calculate complement = target - nums[i].
We maintain a Hash Map mapping value -> index. If the complement is already in the map, its index is map[complement] and the current index is i.
This reduces lookup time from O(n) to O(1), giving an overall O(n) runtime complexity.`
  },

  // 2. Reverse Array (LeetCode #2 / Array Reverse)
  'reverse array': {
    leetcodeNumber: 2,
    title: 'Reverse Array',
    difficulty: 'Easy',
    topic: 'Arrays',
    topics: ['Array', 'Two Pointers'],
    companies: ['Amazon', 'Microsoft', 'Bloomberg'],
    acceptedCount: '4,892,100',
    totalSubmissionsCount: '8.1M',
    acceptanceRate: '60.4%',
    description: `Given an array of integers arr, reverse the elements of the array in-place so that the first element becomes the last, and the last becomes the first.

Return the reversed array.`,
    examples: [
      {
        id: 1,
        input: 'arr = [1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
        explanation: 'The entire array is reversed in order.'
      },
      {
        id: 2,
        input: 'arr = [10, 20, 30]',
        output: '[30, 20, 10]',
        explanation: 'The array elements are swapped symmetrically.'
      }
    ],
    constraints: [
      '1 <= arr.length <= 10^5',
      '-10^4 <= arr[i] <= 10^4'
    ],
    followUp: 'Can you reverse the array in-place using O(1) extra memory?',
    hints: [
      'Use two pointers: one starting from the beginning (left = 0) and one from the end (right = n - 1).',
      'Swap arr[left] and arr[right], then increment left and decrement right until they meet.'
    ],
    similarQuestions: [
      { title: 'Rotate Array', difficulty: 'Medium' },
      { title: 'Reverse String', difficulty: 'Easy' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public void reverseArray(int[] arr) {
        
    }
}`,
      PYTHON: `class Solution:
    def reverseArray(self, arr: list[int]) -> None:
        `,
      CPP: `class Solution {
public:
    void reverseArray(vector<int>& arr) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {number[]} arr
 * @return {void}
 */
var reverseArray = function(arr) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\s+");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i]);
        new Solution().reverseArray(arr);
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i] + (i == arr.length - 1 ? "" : " "));
        }
        System.out.println();
    }
}`,
      PYTHON: `if __name__ == '__main__':
    data = sys.stdin.read().strip()
    if data:
        arr = list(map(int, data.split()))
        Solution().reverseArray(arr)
        print(" ".join(map(str, arr)))`,
      CPP: `int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> arr;
        int val;
        while (ss >> val) arr.push_back(val);
        Solution().reverseArray(arr);
        for (int i = 0; i < arr.size(); i++) {
            cout << arr[i] << (i + 1 == arr.size() ? "" : " ");
        }
        cout << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Two Pointers In-Place Swap',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Initialize a pointer at the beginning and one at the end. Swap elements and move inward until pointers cross.'
      }
    ],
    editorial: `The two-pointer technique solves this problem in O(n/2) iterations with O(1) auxiliary space, which is optimal.`
  },

  // 3. Reverse String (LeetCode #344)
  'reverse string': {
    leetcodeNumber: 344,
    title: 'Reverse String',
    difficulty: 'Easy',
    topic: 'Strings',
    topics: ['Two Pointers', 'String'],
    companies: ['Amazon', 'Apple', 'Google', 'Microsoft', 'Adobe'],
    acceptedCount: '3,120,400',
    totalSubmissionsCount: '3.9M',
    acceptanceRate: '79.2%',
    description: `Write a function that reverses a string. The input string is given as an array of characters or string s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    examples: [
      {
        id: 1,
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: 'The characters are reversed in-place.'
      },
      {
        id: 2,
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: 'All casing is preserved during reversal.'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.'
    ],
    hints: [
      'The entire logic for reversing a string is based on using the opposite direction two-pointer approach!'
    ],
    similarQuestions: [
      { title: 'Reverse Vowels of a String', difficulty: 'Easy' },
      { title: 'Reverse String II', difficulty: 'Easy' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public String reverseString(String str) {
        
    }
}`,
      PYTHON: `class Solution:
    def reverseString(self, s: str) -> str:
        `,
      CPP: `class Solution {
public:
    string reverseString(string s) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {string} str
 * @return {string}
 */
var reverseString = function(str) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String str = sc.nextLine();
        System.out.println(new Solution().reverseString(str));
    }
}`,
      PYTHON: `if __name__ == '__main__':
    s = sys.stdin.read().rstrip('\r\n')
    print(Solution().reverseString(s))`,
      CPP: `int main() {
    string s;
    if (getline(cin, s)) {
        cout << Solution().reverseString(s) << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Two Pointers Approach',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Iterate from both ends of the string towards the center, swapping corresponding characters.'
      }
    ],
    editorial: `We can maintain two pointers, left and right. In each step, we swap s[left] and s[right], then advance left and decrement right. When left >= right, the string is reversed in-place.`
  },

  // 4. Palindrome Number
  'palindrome number': {
    leetcodeNumber: 4,
    title: 'Palindrome Number',
    difficulty: 'Easy',
    topic: 'Mathematics',
    topics: ['Math'],
    companies: ['Amazon', 'Bloomberg', 'Google', 'Microsoft', 'Adobe'],
    acceptedCount: '6,230,100',
    totalSubmissionsCount: '10.8M',
    acceptanceRate: '57.8%',
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same forward and backward. For example, 121 is a palindrome while 123 is not.`,
    examples: [
      {
        id: 1,
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      },
      {
        id: 2,
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.'
      },
      {
        id: 3,
        input: 'x = 10',
        output: 'false',
        explanation: 'Reads 01 from right to left. Therefore it is not a palindrome.'
      }
    ],
    constraints: [
      '-2^31 <= x <= 2^31 - 1'
    ],
    followUp: 'Could you solve it without converting the integer to a string?',
    hints: [
      'Beware of negative numbers. -121 reversed is 121-, so negative numbers can never be palindromes.',
      'Could you revert half of the number instead of the whole number to avoid integer overflow?'
    ],
    similarQuestions: [
      { title: 'Palindrome Linked List', difficulty: 'Easy' },
      { title: 'Valid Palindrome', difficulty: 'Easy' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public boolean isPalindrome(int x) {
        
    }
}`,
      PYTHON: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        `,
      CPP: `class Solution {
public:
    bool isPalindrome(int x) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            System.out.println(new Solution().isPalindrome(sc.nextInt()) ? "true" : "false");
        }
    }
}`,
      PYTHON: `if __name__ == '__main__':
    data = sys.stdin.read().strip()
    if data:
        print("true" if Solution().isPalindrome(int(data)) else "false")`,
      CPP: `int main() {
    int x;
    if (cin >> x) {
        cout << (Solution().isPalindrome(x) ? "true" : "false") << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Revert Half of the Number',
        timeComplexity: 'O(log10(n))',
        spaceComplexity: 'O(1)',
        description: 'Reverse the last half of the digits and compare it with the first half. When x <= revertedNumber, we have reached the midpoint.'
      }
    ],
    editorial: `Negative numbers are never palindromic. Numbers ending with zero (except 0 itself) cannot be palindromes because the leading digit cannot be 0. We can construct the reversed half using modulo arithmetic.`
  },

  // 5. Maximum Subarray (LeetCode #53)
  'maximum subarray': {
    leetcodeNumber: 5,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    topics: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    companies: ['Amazon', 'Microsoft', 'Apple', 'Google', 'Meta', 'Cisco'],
    acceptedCount: '4,150,800',
    totalSubmissionsCount: '8.2M',
    acceptanceRate: '51.3%',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      {
        id: 1,
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        id: 2,
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.'
      },
      {
        id: 3,
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
        explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    followUp: 'If you have figured out the O(n) solution, try coding another solution using the divide and conquer approach, which is more subtle.',
    hints: [
      'Think about Kadane\'s Algorithm: whenever the running sum drops below 0, it won\'t contribute positively to subsequent elements.',
      'Reset running sum to 0 whenever it becomes negative.'
    ],
    similarQuestions: [
      { title: 'Maximum Product Subarray', difficulty: 'Medium' },
      { title: 'Degree of an Array', difficulty: 'Easy' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public int maxSubArray(int[] nums) {
        
    }
}`,
      PYTHON: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        `,
      CPP: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        System.out.println(new Solution().maxSubArray(nums));
    }
}`,
      PYTHON: `if __name__ == '__main__':
    data = sys.stdin.read().strip()
    if data:
        nums = list(map(int, data.split()))
        print(Solution().maxSubArray(nums))`,
      CPP: `int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        cout << Solution().maxSubArray(nums) << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Kadane\'s Algorithm (Dynamic Programming)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Iterate through the array and update the maximum sum ending at each position. If current sum is negative, reset.'
      }
    ],
    editorial: `Kadane's algorithm works by observing that any negative subarray prefix will only decrease the sum of any subsequent subarray. Thus, whenever currentSum drops below nums[i], we start a new subarray at nums[i].`
  },

  // 6. Move Zeroes (LeetCode #283)
  'move zeroes': {
    leetcodeNumber: 283,
    title: 'Move Zeroes',
    difficulty: 'Easy',
    topic: 'Arrays',
    topics: ['Array', 'Two Pointers'],
    companies: ['Meta', 'Amazon', 'Apple', 'Microsoft', 'Bloomberg'],
    acceptedCount: '3,890,200',
    totalSubmissionsCount: '6.2M',
    acceptanceRate: '62.1%',
    description: `Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.

Note that you must do this in-place without making a copy of the array.`,
    examples: [
      {
        id: 1,
        input: 'nums = [0,1,0,3,12]',
        output: '[1,3,12,0,0]',
        explanation: 'All non-zero elements [1, 3, 12] remain in original order, zeroes are moved to the back.'
      },
      {
        id: 2,
        input: 'nums = [0]',
        output: '[0]',
        explanation: 'Array contains single zero.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-2^31 <= nums[i] <= 2^31 - 1'
    ],
    followUp: 'Could you minimize the total number of operations done?',
    hints: [
      'In-place means we should not allocate an extra array.',
      'A two-pointer approach could be helpful here: fast pointer iterates through array, slow pointer marks position for next non-zero element.'
    ],
    similarQuestions: [
      { title: 'Remove Element', difficulty: 'Easy' },
      { title: 'Apply Operations to an Array', difficulty: 'Easy' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public void moveZeroes(int[] nums) {
        
    }
}`,
      PYTHON: `class Solution:
    def moveZeroes(self, nums: list[int]) -> None:
        `,
      CPP: `class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {number[]} nums
 * @return {void}
 */
var moveZeroes = function(nums) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        new Solution().moveZeroes(nums);
        for (int i = 0; i < nums.length; i++) {
            System.out.print(nums[i] + (i == nums.length - 1 ? "" : " "));
        }
        System.out.println();
    }
}`,
      PYTHON: `if __name__ == '__main__':
    data = sys.stdin.read().strip()
    if data:
        nums = list(map(int, data.split()))
        Solution().moveZeroes(nums)
        print(" ".join(map(str, nums)))`,
      CPP: `int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        Solution().moveZeroes(nums);
        for (int i = 0; i < nums.size(); i++) {
            cout << nums[i] << (i + 1 == nums.size() ? "" : " ");
        }
        cout << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Two Pointers (Optimal)',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Maintain a slow pointer indicating where the next non-zero should go. Whenever the fast pointer finds a non-zero, swap.'
      }
    ],
    editorial: `All non-zero elements are moved forward maintaining relative order. Every swap places a non-zero into its final correct slot and moves the zero backward.`
  },

  // 7. Longest Substring Without Repeating Characters (LeetCode #3)
  'longest substring without repeating characters': {
    leetcodeNumber: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Strings',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    companies: ['Amazon', 'Google', 'Apple', 'Microsoft', 'Bloomberg', 'Meta'],
    acceptedCount: '6,410,200',
    totalSubmissionsCount: '17.8M',
    acceptanceRate: '35.9%',
    description: `Given a string s, find the length of the longest substring without duplicate characters.`,
    examples: [
      {
        id: 1,
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        id: 2,
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      },
      {
        id: 3,
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.'
      }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    hints: [
      'Use a sliding window [left, right] to keep track of the current substring without duplicates.',
      'A Hash Map can store the last index where each character occurred to jump left pointer ahead instantly.'
    ],
    similarQuestions: [
      { title: 'Longest Substring with At Most Two Distinct Characters', difficulty: 'Medium' },
      { title: 'Subarrays with K Different Integers', difficulty: 'Hard' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        
    }
}`,
      PYTHON: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        `,
      CPP: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(new Solution().lengthOfLongestSubstring(s));
    }
}`,
      PYTHON: `if __name__ == '__main__':
    s = sys.stdin.read().rstrip('\r\n')
    print(Solution().lengthOfLongestSubstring(s))`,
      CPP: `int main() {
    string s;
    if (getline(cin, s)) {
        cout << Solution().lengthOfLongestSubstring(s) << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Sliding Window with Hash Map',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(min(n, m))',
        description: 'Expand the right edge of the window. When a repeated character is encountered, jump the left edge immediately after the previous occurrence.'
      }
    ],
    editorial: `The naive solution checks all substrings in O(n³). Using a sliding window reduces this to O(n) as each character is visited at most twice.`
  },

  // 8. Trapping Rain Water (LeetCode #42)
  'trapping rain water': {
    leetcodeNumber: 42,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    topics: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    companies: ['Amazon', 'Google', 'Meta', 'Goldman Sachs', 'Apple', 'Bloomberg'],
    acceptedCount: '2,670,400',
    totalSubmissionsCount: '4.3M',
    acceptanceRate: '62.4%',
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    examples: [
      {
        id: 1,
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.'
      },
      {
        id: 2,
        input: 'height = [4,2,0,3,2,5]',
        output: '9',
        explanation: '9 units of water are trapped between elevation bars.'
      }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    hints: [
      'For each element, the water trapped above it is min(max_left, max_right) - height[i].',
      'We can precompute the max_left and max_right using two arrays or dynamically track them with two pointers.'
    ],
    similarQuestions: [
      { title: 'Container With Most Water', difficulty: 'Medium' },
      { title: 'Product of Array Except Self', difficulty: 'Medium' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public int trap(int[] height) {
        
    }
}`,
      PYTHON: `class Solution:
    def trap(self, height: list[int]) -> int:
        `,
      CPP: `class Solution {
public:
    int trap(vector<int>& height) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\s+");
        int[] height = new int[parts.length];
        for (int i = 0; i < parts.length; i++) height[i] = Integer.parseInt(parts[i]);
        System.out.println(new Solution().trap(height));
    }
}`,
      PYTHON: `if __name__ == '__main__':
    data = sys.stdin.read().strip()
    if data:
        height = list(map(int, data.split()))
        print(Solution().trap(height))`,
      CPP: `int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> height;
        int val;
        while (ss >> val) height.push_back(val);
        cout << Solution().trap(height) << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Two Pointers Approach',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Maintain left and right boundaries with their respective max heights. The lower boundary dictates trapped water amount.'
      }
    ],
    editorial: `Water level at any bar is determined by the lower of the maximum bar to its left and right. Moving from the lower boundary guarantees that the water trapped depends only on that boundary.'`
  },

  // 9. Valid Anagram (LeetCode #242)
  'valid anagram': {
    leetcodeNumber: 242,
    title: 'Valid Anagram',
    difficulty: 'Easy',
    topic: 'Strings',
    topics: ['Hash Table', 'String', 'Sorting'],
    companies: ['Bloomberg', 'Amazon', 'Apple', 'Google', 'Meta'],
    acceptedCount: '4,102,900',
    totalSubmissionsCount: '6.4M',
    acceptanceRate: '64.5%',
    description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      {
        id: 1,
        input: 's = "anagram", t = "nagaram"',
        output: 'true',
        explanation: 'Both strings contain the same character frequency counts.'
      },
      {
        id: 2,
        input: 's = "rat", t = "car"',
        output: 'false',
        explanation: 'Character frequencies differ between strings.'
      }
    ],
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.'
    ],
    followUp: 'What if the inputs contain Unicode characters? How would you adapt your solution?',
    hints: [
      'Two strings are anagrams if and only if their sorted versions are identical, or character counts match.'
    ],
    similarQuestions: [
      { title: 'Group Anagrams', difficulty: 'Medium' },
      { title: 'Find All Anagrams in a String', difficulty: 'Medium' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public boolean isAnagram(String s, String t) {
        
    }
}`,
      PYTHON: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        `,
      CPP: `class Solution {
public:
    bool isAnagram(string s, string t) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine().trim();
        String t = sc.hasNextLine() ? sc.nextLine().trim() : "";
        System.out.println(new Solution().isAnagram(s, t) ? "true" : "false");
    }
}`,
      PYTHON: `if __name__ == '__main__':
    lines = sys.stdin.read().strip().split('\n')
    if len(lines) >= 2:
        print("true" if Solution().isAnagram(lines[0].strip(), lines[1].strip()) else "false")`,
      CPP: `int main() {
    string s, t;
    if (cin >> s >> t) {
        cout << (Solution().isAnagram(s, t) ? "true" : "false") << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Frequency Counter Array',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Count character occurrences across a 26-element array and verify all net frequencies equal zero.'
      }
    ],
    editorial: `Since there are only 26 lowercase English letters, a fixed size frequency table runs in O(n) time and O(1) space.`
  },

  // 10. Contains Duplicate (LeetCode #217)
  'contains duplicate': {
    leetcodeNumber: 217,
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    topic: 'Arrays',
    topics: ['Array', 'Hash Table', 'Sorting'],
    companies: ['Apple', 'Microsoft', 'Bloomberg', 'Amazon', 'Meta'],
    acceptedCount: '4,890,100',
    totalSubmissionsCount: '7.8M',
    acceptanceRate: '62.6%',
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
    examples: [
      {
        id: 1,
        input: 'nums = [1,2,3,1]',
        output: 'true',
        explanation: '1 occurs at index 0 and 3.'
      },
      {
        id: 2,
        input: 'nums = [1,2,3,4]',
        output: 'false',
        explanation: 'All elements are distinct.'
      },
      {
        id: 3,
        input: 'nums = [1,1,1,3,3,4,3,2,4,2]',
        output: 'true',
        explanation: 'Multiple duplicate elements exist.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9'
    ],
    hints: [
      'A Hash Set stores unique elements in O(1) time complexity.'
    ],
    similarQuestions: [
      { title: 'Contains Duplicate II', difficulty: 'Easy' },
      { title: 'Contains Duplicate III', difficulty: 'Hard' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        
    }
}`,
      PYTHON: `class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        `,
      CPP: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().trim().split("\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        System.out.println(new Solution().containsDuplicate(nums) ? "true" : "false");
    }
}`,
      PYTHON: `if __name__ == '__main__':
    data = sys.stdin.read().strip()
    if data:
        nums = list(map(int, data.split()))
        print("true" if Solution().containsDuplicate(nums) else "false")`,
      CPP: `int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        cout << (Solution().containsDuplicate(nums) ? "true" : "false") << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Hash Set Lookup',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        description: 'Iterate through the array and insert each element into a hash set. If an insertion fails, a duplicate is found.'
      }
    ],
    editorial: `Using a hash set allows O(1) average-time lookups to detect duplicates during a single linear scan.'`
  },

  // 11. Climbing Stairs 
  'climbing stairs': {
    leetcodeNumber: 11,
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    topics: ['Math', 'Dynamic Programming', 'Memoization'],
    companies: ['Amazon', 'Google', 'Apple', 'Meta', 'Microsoft', 'Bloomberg'],
    acceptedCount: '3,920,400',
    totalSubmissionsCount: '7.4M',
    acceptanceRate: '53.1%',
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      {
        id: 1,
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps'
      },
      {
        id: 2,
        input: 'n = 3',
        output: '3',
        explanation: 'There are three ways to climb to the top:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step'
      }
    ],
    constraints: [
      '1 <= n <= 45'
    ],
    hints: [
      'To reach step n, you can either step from step n - 1 or step n - 2.',
      'Therefore, ways(n) = ways(n - 1) + ways(n - 2). This is the Fibonacci sequence!'
    ],
    similarQuestions: [
      { title: 'Min Cost Climbing Stairs', difficulty: 'Easy' },
      { title: 'Fibonacci Number', difficulty: 'Easy' }
    ],
    starterTemplates: {
      JAVA: `class Solution {
    public int climbStairs(int n) {
        
    }
}`,
      PYTHON: `class Solution:
    def climbStairs(self, n: int) -> int:
        `,
      CPP: `class Solution {
public:
    int climbStairs(int n) {
        
    }
};`,
      JAVASCRIPT: `/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    
};`
    },
    driverCode: {
      JAVA: `class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            System.out.println(new Solution().climbStairs(sc.nextInt()));
        }
    }
}`,
      PYTHON: `if __name__ == '__main__':
    data = sys.stdin.read().strip()
    if data:
        print(Solution().climbStairs(int(data)))`,
      CPP: `int main() {
    int n;
    if (cin >> n) {
        cout << Solution().climbStairs(n) << endl;
    }
    return 0;
}`
    },
    solutions: [
      {
        title: 'Fibonacci Dynamic Programming',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        description: 'Calculate the total number of ways iteratively using two variables to remember the previous two values.'
      }
    ],
    editorial: `The number of ways to reach step n is ways(n - 1) + ways(n - 2). With base cases ways(1) = 1 and ways(2) = 2, this matches the Fibonacci sequence.'`
  }
};

/**
 * Helper to fetch problem metadata by title or id
 */
export const getLeetCodeMetadata = (title) => {
  if (!title) return null;
  const key = title.trim().toLowerCase();
  return LEETCODE_PROBLEMS[key] || null;
};
