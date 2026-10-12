const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Test = require('../models/Test');
const Section = require('../models/Section');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Test.deleteMany({});
    await Section.deleteMany({});
    await Question.deleteMany({});
    await TestAttempt.deleteMany({});

    console.log('Seeding Categories...');
    const categories = await Category.insertMany([
      { name: 'SSC', description: 'Staff Selection Commission Exams (CGL, CHSL, MTS, CPO)' },
      { name: 'Banking', description: 'Bank Exams (IBPS PO, SBI PO, RBI Assistant, Clerk)' },
      { name: 'Railway', description: 'Railway Recruitment Board (RRB NTPC, Group D, ALP)' },
      { name: 'Defence', description: 'Defence Exams (CDS, NDA, AFCAT, CAPF)' },
      { name: 'UPSC', description: 'Union Public Service Commission Civil Services' },
      { name: 'TNPSC', description: 'Tamil Nadu Public Service Commission' },
      { name: 'Other Central Govt', description: 'Other Central Government Competitive Exams' }
    ]);

    console.log('Seeding Users...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@exam.com',
      password: 'Admin@123',
      phone: '9876543210',
      role: 'admin',
      status: 'active'
    });

    const studentUser = await User.create({
      name: 'Test Student',
      email: 'user@exam.com',
      password: 'User@123',
      phone: '9123456789',
      role: 'user',
      status: 'active'
    });

    console.log('Seeding SSC CGL Mock Test 01 (40 Questions)...');
    const mockTest = await Test.create({
      title: 'SSC CGL Mock Test 01',
      category: 'SSC',
      description: 'Comprehensive Tier-1 Mock Test with English, Reasoning, Maths, and General Awareness.',
      totalQuestions: 40,
      totalDuration: 60,
      status: 'Published',
      createdBy: adminUser._id
    });

    // 1. English Section (15 mins, 10 questions)
    const secEnglish = await Section.create({
      testId: mockTest._id,
      name: 'English',
      duration: 15,
      order: 1
    });

    const englishQ = [
      {
        questionText: 'Choose the correct synonym of "Rapid".',
        options: [
          { key: 'A', text: 'Slow' },
          { key: 'B', text: 'Fast' },
          { key: 'C', text: 'Weak' },
          { key: 'D', text: 'Small' }
        ],
        correctAnswer: 'B',
        explanation: 'Rapid means happening or moving with great speed, which is synonymous with fast.'
      },
      {
        questionText: 'Select the correctly spelt word.',
        options: [
          { key: 'A', text: 'Accomodate' },
          { key: 'B', text: 'Accommodate' },
          { key: 'C', text: 'Acomodate' },
          { key: 'D', text: 'Accommoodate' }
        ],
        correctAnswer: 'B',
        explanation: 'The correct spelling is "Accommodate" with double c and double m.'
      },
      {
        questionText: 'Choose the antonym of "Transient".',
        options: [
          { key: 'A', text: 'Temporary' },
          { key: 'B', text: 'Permanent' },
          { key: 'C', text: 'Fleeting' },
          { key: 'D', text: 'Brief' }
        ],
        correctAnswer: 'B',
        explanation: 'Transient means lasting only for a short time. Its opposite is permanent.'
      },
      {
        questionText: 'Fill in the blank: Neither John nor his friends _____ present at the event.',
        options: [
          { key: 'A', text: 'was' },
          { key: 'B', text: 'were' },
          { key: 'C', text: 'is' },
          { key: 'D', text: 'has been' }
        ],
        correctAnswer: 'B',
        explanation: 'With "neither...nor", the verb agrees with the subject nearest to it ("friends").'
      },
      {
        questionText: 'Identify the idiom meaning "to face a difficult situation with courage":',
        options: [
          { key: 'A', text: 'Bite the bullet' },
          { key: 'B', text: 'Burn the midnight oil' },
          { key: 'C', text: 'Spill the beans' },
          { key: 'D', text: 'Break the ice' }
        ],
        correctAnswer: 'A',
        explanation: '"Bite the bullet" means to endure a painful or difficult situation bravely.'
      },
      {
        questionText: 'Select the one-word substitution: "A person who loves books".',
        options: [
          { key: 'A', text: 'Bibliophile' },
          { key: 'B', text: 'Philanthropist' },
          { key: 'C', text: 'Misogynist' },
          { key: 'D', text: 'Polyglot' }
        ],
        correctAnswer: 'A',
        explanation: 'A bibliophile is a person who collects or has a great love of books.'
      },
      {
        questionText: 'Change into passive voice: "The manager approved the project."',
        options: [
          { key: 'A', text: 'The project is approved by the manager.' },
          { key: 'B', text: 'The project was approved by the manager.' },
          { key: 'C', text: 'The project had been approved by the manager.' },
          { key: 'D', text: 'The manager was approving the project.' }
        ],
        correctAnswer: 'B',
        explanation: 'Past simple active "approved" changes to "was approved" in passive voice.'
      },
      {
        questionText: 'Find the error in: "She is senior than me in the organization."',
        options: [
          { key: 'A', text: 'She is' },
          { key: 'B', text: 'senior than' },
          { key: 'C', text: 'me in' },
          { key: 'D', text: 'the organization' }
        ],
        correctAnswer: 'B',
        explanation: 'Adjectives like senior, junior, superior take preposition "to" instead of "than". (senior to me).'
      },
      {
        questionText: 'Select the synonym of "Obsolete".',
        options: [
          { key: 'A', text: 'Modern' },
          { key: 'B', text: 'Outdated' },
          { key: 'C', text: 'Recent' },
          { key: 'D', text: 'Vast' }
        ],
        correctAnswer: 'B',
        explanation: 'Obsolete means no longer produced or used; out of date.'
      },
      {
        questionText: 'Fill in: The teacher warned him _____ repeating the mistake.',
        options: [
          { key: 'A', text: 'against' },
          { key: 'B', text: 'for' },
          { key: 'C', text: 'with' },
          { key: 'D', text: 'about to' }
        ],
        correctAnswer: 'A',
        explanation: 'The verb "warn" is followed by "against" when cautioning not to do something.'
      }
    ];

    for (let i = 0; i < englishQ.length; i++) {
      await Question.create({
        testId: mockTest._id,
        sectionId: secEnglish._id,
        questionNumber: i + 1,
        ...englishQ[i]
      });
    }

    // 2. Reasoning Section (15 mins, 10 questions)
    const secReasoning = await Section.create({
      testId: mockTest._id,
      name: 'Reasoning',
      duration: 15,
      order: 2
    });

    const reasoningQ = [
      {
        questionText: 'Find the missing number in series: 2, 4, 8, 16, ?',
        options: [
          { key: 'A', text: '24' },
          { key: 'B', text: '30' },
          { key: 'C', text: '32' },
          { key: 'D', text: '64' }
        ],
        correctAnswer: 'C',
        explanation: 'Pattern: Multiply previous number by 2. 16 * 2 = 32.'
      },
      {
        questionText: 'If CAT is coded as 3120, how is DOG coded?',
        options: [
          { key: 'A', text: '4157' },
          { key: 'B', text: '4147' },
          { key: 'C', text: '4158' },
          { key: 'D', text: '3157' }
        ],
        correctAnswer: 'A',
        explanation: 'Letter alphabetical positions: D=4, O=15, G=7 -> 4157.'
      },
      {
        questionText: 'Select the related word pair: Doctor : Hospital :: Teacher : ?',
        options: [
          { key: 'A', text: 'Office' },
          { key: 'B', text: 'School' },
          { key: 'C', text: 'Court' },
          { key: 'D', text: 'Library' }
        ],
        correctAnswer: 'B',
        explanation: 'Doctor works in a hospital; Teacher works in a school.'
      },
      {
        questionText: 'Find the odd one out:',
        options: [
          { key: 'A', text: 'Apple' },
          { key: 'B', text: 'Banana' },
          { key: 'C', text: 'Potato' },
          { key: 'D', text: 'Mango' }
        ],
        correctAnswer: 'C',
        explanation: 'Potato is a vegetable/tuber, while Apple, Banana, and Mango are fruits.'
      },
      {
        questionText: 'If A is the father of B, and B is the mother of C, how is A related to C?',
        options: [
          { key: 'A', text: 'Father' },
          { key: 'B', text: 'Maternal Grandfather' },
          { key: 'C', text: 'Uncle' },
          { key: 'D', text: 'Brother' }
        ],
        correctAnswer: 'B',
        explanation: 'Mother\'s father is the maternal grandfather.'
      },
      {
        questionText: 'Find the missing term: B, D, F, H, ?',
        options: [
          { key: 'A', text: 'I' },
          { key: 'B', text: 'J' },
          { key: 'C', text: 'K' },
          { key: 'D', text: 'L' }
        ],
        correctAnswer: 'B',
        explanation: 'Skip one letter each time (+2): B(2), D(4), F(6), H(8), J(10).'
      },
      {
        questionText: 'Facing North, Rahul walks 10m, turns right and walks 5m. Which direction is he facing?',
        options: [
          { key: 'A', text: 'North' },
          { key: 'B', text: 'East' },
          { key: 'C', text: 'South' },
          { key: 'D', text: 'West' }
        ],
        correctAnswer: 'B',
        explanation: 'Turning right from North faces East.'
      },
      {
        questionText: 'Which letter replaces question mark? ACE, GIK, MOQ, ?',
        options: [
          { key: 'A', text: 'SUW' },
          { key: 'B', text: 'RTV' },
          { key: 'C', text: 'TXZ' },
          { key: 'D', text: 'SUV' }
        ],
        correctAnswer: 'A',
        explanation: 'Each block steps by 2 letters. M(13)+6=S(19), O(15)+6=U(21), Q(17)+6=W(23) -> SUW.'
      },
      {
        questionText: 'In a class of 30 students, Amit ranks 10th from top. What is his rank from bottom?',
        options: [
          { key: 'A', text: '20th' },
          { key: 'B', text: '21st' },
          { key: 'C', text: '22nd' },
          { key: 'D', text: '19th' }
        ],
        correctAnswer: 'B',
        explanation: 'Rank from bottom = (Total + 1) - Rank from top = (30 + 1) - 10 = 21.'
      },
      {
        questionText: 'Choose the correct mirror image of term "EXAM":',
        options: [
          { key: 'A', text: 'MAXE' },
          { key: 'B', text: 'ƎXAM' },
          { key: 'C', text: 'MAXƎ' },
          { key: 'D', text: 'MAZE' }
        ],
        correctAnswer: 'C',
        explanation: 'Mirror image reverses letter order and flips individual asymmetrical characters.'
      }
    ];

    for (let i = 0; i < reasoningQ.length; i++) {
      await Question.create({
        testId: mockTest._id,
        sectionId: secReasoning._id,
        questionNumber: i + 11,
        ...reasoningQ[i]
      });
    }

    // 3. Mathematics Section (20 mins, 10 questions)
    const secMaths = await Section.create({
      testId: mockTest._id,
      name: 'Mathematics',
      duration: 20,
      order: 3
    });

    const mathsQ = [
      {
        questionText: 'What is 25% of 200?',
        options: [
          { key: 'A', text: '25' },
          { key: 'B', text: '40' },
          { key: 'C', text: '50' },
          { key: 'D', text: '75' }
        ],
        correctAnswer: 'C',
        explanation: '(25 / 100) * 200 = 50.'
      },
      {
        questionText: 'If the ratio of two numbers is 3:4 and their sum is 70, find the larger number.',
        options: [
          { key: 'A', text: '30' },
          { key: 'B', text: '40' },
          { key: 'C', text: '50' },
          { key: 'D', text: '60' }
        ],
        correctAnswer: 'B',
        explanation: 'Sum parts = 3 + 4 = 7. 1 part = 70/7 = 10. Larger = 4 * 10 = 40.'
      },
      {
        questionText: 'What is the average of first 5 natural numbers (1, 2, 3, 4, 5)?',
        options: [
          { key: 'A', text: '2.5' },
          { key: 'B', text: '3' },
          { key: 'C', text: '3.5' },
          { key: 'D', text: '4' }
        ],
        correctAnswer: 'B',
        explanation: 'Sum = 15. Average = 15 / 5 = 3.'
      },
      {
        questionText: 'A car covers a distance of 150 km in 3 hours. What is its speed in km/h?',
        options: [
          { key: 'A', text: '45' },
          { key: 'B', text: '50' },
          { key: 'C', text: '55' },
          { key: 'D', text: '60' }
        ],
        correctAnswer: 'B',
        explanation: 'Speed = Distance / Time = 150 / 3 = 50 km/h.'
      },
      {
        questionText: 'Find Simple Interest on ₹ 5000 at 10% per annum for 2 years.',
        options: [
          { key: 'A', text: '₹ 500' },
          { key: 'B', text: '₹ 1000' },
          { key: 'C', text: '₹ 1200' },
          { key: 'D', text: '₹ 1500' }
        ],
        correctAnswer: 'B',
        explanation: 'SI = (P * R * T) / 100 = (5000 * 10 * 2) / 100 = ₹ 1000.'
      },
      {
        questionText: 'If Cost Price is ₹ 80 and Selling Price is ₹ 100, what is the profit percentage?',
        options: [
          { key: 'A', text: '20%' },
          { key: 'B', text: '25%' },
          { key: 'C', text: '30%' },
          { key: 'D', text: '15%' }
        ],
        correctAnswer: 'B',
        explanation: 'Profit = 100 - 80 = 20. Profit % = (20 / 80) * 100 = 25%.'
      },
      {
        questionText: 'What is the HCF of 24 and 36?',
        options: [
          { key: 'A', text: '6' },
          { key: 'B', text: '12' },
          { key: 'C', text: '18' },
          { key: 'D', text: '72' }
        ],
        correctAnswer: 'B',
        explanation: 'Factors of 24: 1,2,3,4,6,8,12,24. Factors of 36: 1,2,3,4,6,9,12,18,36. Highest common factor is 12.'
      },
      {
        questionText: 'If 12 men can complete a work in 10 days, how many days will 15 men take to complete the same work?',
        options: [
          { key: 'A', text: '6 days' },
          { key: 'B', text: '8 days' },
          { key: 'C', text: '9 days' },
          { key: 'D', text: '10 days' }
        ],
        correctAnswer: 'B',
        explanation: 'Man-days = 12 * 10 = 120. Days for 15 men = 120 / 15 = 8 days.'
      },
      {
        questionText: 'Calculate the perimeter of a rectangle with length 15 cm and breadth 10 cm.',
        options: [
          { key: 'A', text: '25 cm' },
          { key: 'B', text: '50 cm' },
          { key: 'C', text: '150 cm' },
          { key: 'D', text: '100 cm' }
        ],
        correctAnswer: 'B',
        explanation: 'Perimeter = 2 * (length + breadth) = 2 * (15 + 10) = 50 cm.'
      },
      {
        questionText: 'Solve: 15 + 5 * 2 - 4 / 2 = ?',
        options: [
          { key: 'A', text: '23' },
          { key: 'B', text: '38' },
          { key: 'C', text: '18' },
          { key: 'D', text: '25' }
        ],
        correctAnswer: 'A',
        explanation: 'Using BODMAS: Multiplication and division first -> 5*2=10, 4/2=2. Expression: 15 + 10 - 2 = 23.'
      }
    ];

    for (let i = 0; i < mathsQ.length; i++) {
      await Question.create({
        testId: mockTest._id,
        sectionId: secMaths._id,
        questionNumber: i + 21,
        ...mathsQ[i]
      });
    }

    // 4. General Awareness Section (10 mins, 10 questions)
    const secGK = await Section.create({
      testId: mockTest._id,
      name: 'General Awareness',
      duration: 10,
      order: 4
    });

    const gkQ = [
      {
        questionText: 'Who is known as the Father of the Indian Constitution?',
        options: [
          { key: 'A', text: 'Mahatma Gandhi' },
          { key: 'B', text: 'Dr. B.R. Ambedkar' },
          { key: 'C', text: 'Jawaharlal Nehru' },
          { key: 'D', text: 'Sardar Patel' }
        ],
        correctAnswer: 'B',
        explanation: 'Dr. B.R. Ambedkar was the Chairman of the Drafting Committee of the Constitution of India.'
      },
      {
        questionText: 'Which river is known as the "Sorrow of Bengal"?',
        options: [
          { key: 'A', text: 'Ganga' },
          { key: 'B', text: 'Yamuna' },
          { key: 'C', text: 'Damodar River' },
          { key: 'D', text: 'Kosi River' }
        ],
        correctAnswer: 'C',
        explanation: 'Damodar River was formerly known as the Sorrow of Bengal due to devastating seasonal floods.'
      },
      {
        questionText: 'What is the capital of India?',
        options: [
          { key: 'A', text: 'Mumbai' },
          { key: 'B', text: 'Kolkata' },
          { key: 'C', text: 'New Delhi' },
          { key: 'D', text: 'Chennai' }
        ],
        correctAnswer: 'C',
        explanation: 'New Delhi is the official national capital of India.'
      },
      {
        questionText: 'Which planet is known as the "Red Planet"?',
        options: [
          { key: 'A', text: 'Venus' },
          { key: 'B', text: 'Mars' },
          { key: 'C', text: 'Jupiter' },
          { key: 'D', text: 'Saturn' }
        ],
        correctAnswer: 'B',
        explanation: 'Mars is called the Red Planet because of the iron oxide present on its surface.'
      },
      {
        questionText: 'Which gas is most abundant in Earth\'s atmosphere?',
        options: [
          { key: 'A', text: 'Oxygen' },
          { key: 'B', text: 'Carbon Dioxide' },
          { key: 'C', text: 'Nitrogen' },
          { key: 'D', text: 'Hydrogen' }
        ],
        correctAnswer: 'C',
        explanation: 'Nitrogen makes up approximately 78% of Earth\'s atmosphere.'
      },
      {
        questionText: 'Who wrote the Indian National Anthem "Jana Gana Mana"?',
        options: [
          { key: 'A', text: 'Bankim Chandra Chattopadhyay' },
          { key: 'B', text: 'Rabindranath Tagore' },
          { key: 'C', text: 'Sarojini Naidu' },
          { key: 'D', text: 'Subhash Chandra Bose' }
        ],
        correctAnswer: 'B',
        explanation: 'Rabindranath Tagore composed Jana Gana Mana originally in Bengali.'
      },
      {
        questionText: 'Which fundamental right cannot be suspended even during a National Emergency?',
        options: [
          { key: 'A', text: 'Right to Speech' },
          { key: 'B', text: 'Right to Life and Personal Liberty (Article 21)' },
          { key: 'C', text: 'Right to Equality' },
          { key: 'D', text: 'Right to Freedom of Movement' }
        ],
        correctAnswer: 'B',
        explanation: 'Articles 20 and 21 cannot be suspended even during emergency under Article 359.'
      },
      {
        questionText: 'In which year did India gain independence?',
        options: [
          { key: 'A', text: '1942' },
          { key: 'B', text: '1947' },
          { key: 'C', text: '1950' },
          { key: 'D', text: '1952' }
        ],
        correctAnswer: 'B',
        explanation: 'India gained independence from British rule on 15th August 1947.'
      },
      {
        questionText: 'Which organ in the human body pumps blood?',
        options: [
          { key: 'A', text: 'Lungs' },
          { key: 'B', text: 'Kidney' },
          { key: 'C', text: 'Heart' },
          { key: 'D', text: 'Liver' }
        ],
        correctAnswer: 'C',
        explanation: 'The heart is a muscular organ that pumps blood through the circulatory system.'
      },
      {
        questionText: 'Who is the ex-officio Chairman of Rajya Sabha in India?',
        options: [
          { key: 'A', text: 'Prime Minister' },
          { key: 'B', text: 'President' },
          { key: 'C', text: 'Vice-President of India' },
          { key: 'D', text: 'Speaker of Lok Sabha' }
        ],
        correctAnswer: 'C',
        explanation: 'The Vice-President of India acts as the ex-officio Chairman of the Rajya Sabha.'
      }
    ];

    for (let i = 0; i < gkQ.length; i++) {
      await Question.create({
        testId: mockTest._id,
        sectionId: secGK._id,
        questionNumber: i + 31,
        ...gkQ[i]
      });
    }

    console.log('Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Credentials:');
    console.log('Email: admin@exam.com');
    console.log('Password: Admin@123');
    console.log('----------------------------------------------------');
    console.log('Student Credentials:');
    console.log('Email: user@exam.com');
    console.log('Password: User@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
