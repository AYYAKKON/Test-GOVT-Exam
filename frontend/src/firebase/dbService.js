import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config.js';

// Initial sample data for automatic seeding in Firestore
const DEFAULT_CATEGORIES = [
  { name: 'SSC', description: 'Staff Selection Commission Exams (CGL, CHSL, MTS, CPO)' },
  { name: 'Banking', description: 'Bank Exams (IBPS PO, SBI PO, RBI Assistant, Clerk)' },
  { name: 'Railway', description: 'Railway Recruitment Board (RRB NTPC, Group D, ALP)' },
  { name: 'Defence', description: 'Defence Exams (CDS, NDA, AFCAT, CAPF)' },
  { name: 'UPSC', description: 'Union Public Service Commission Civil Services' },
  { name: 'TNPSC', description: 'Tamil Nadu Public Service Commission' },
  { name: 'Other Central Govt', description: 'Other Central Government Competitive Exams' }
];

const DEFAULT_USERS = [
  {
    name: 'System Admin',
    email: 'admin@examtest.com',
    password: 'Pass@123',
    phone: '9876543210',
    role: 'admin',
    status: 'active'
  }
];

const DEFAULT_TEST = {
  title: 'SSC CGL Mock Test 01',
  category: 'SSC',
  description: 'Comprehensive Tier-1 Mock Test with English, Reasoning, Maths, and General Awareness.',
  totalQuestions: 40,
  totalDuration: 60,
  status: 'Published'
};

const DEFAULT_SECTIONS = [
  { name: 'English', duration: 15, order: 1 },
  { name: 'Reasoning', duration: 15, order: 2 },
  { name: 'Mathematics', duration: 20, order: 3 },
  { name: 'General Awareness', duration: 10, order: 4 }
];

const DEFAULT_QUESTIONS = [
  // English
  {
    sectionIndex: 0,
    questionNumber: 1,
    questionText: 'Choose the correct synonym of "Rapid".',
    options: [{ key: 'A', text: 'Slow' }, { key: 'B', text: 'Fast' }, { key: 'C', text: 'Weak' }, { key: 'D', text: 'Small' }],
    correctAnswer: 'B',
    explanation: 'Rapid means happening or moving with great speed, which is synonymous with fast.'
  },
  {
    sectionIndex: 0,
    questionNumber: 2,
    questionText: 'Select the correctly spelt word.',
    options: [{ key: 'A', text: 'Accomodate' }, { key: 'B', text: 'Accommodate' }, { key: 'C', text: 'Acomodate' }, { key: 'D', text: 'Accommoodate' }],
    correctAnswer: 'B',
    explanation: 'The correct spelling is "Accommodate" with double c and double m.'
  },
  {
    sectionIndex: 0,
    questionNumber: 3,
    questionText: 'Choose the antonym of "Transient".',
    options: [{ key: 'A', text: 'Temporary' }, { key: 'B', text: 'Permanent' }, { key: 'C', text: 'Fleeting' }, { key: 'D', text: 'Brief' }],
    correctAnswer: 'B',
    explanation: 'Transient means lasting only for a short time. Its opposite is permanent.'
  },
  {
    sectionIndex: 0,
    questionNumber: 4,
    questionText: 'Fill in the blank: Neither John nor his friends _____ present at the event.',
    options: [{ key: 'A', text: 'was' }, { key: 'B', text: 'were' }, { key: 'C', text: 'is' }, { key: 'D', text: 'has been' }],
    correctAnswer: 'B',
    explanation: 'With "neither...nor", the verb agrees with the subject nearest to it ("friends").'
  },
  {
    sectionIndex: 0,
    questionNumber: 5,
    questionText: 'Identify the idiom meaning "to face a difficult situation with courage":',
    options: [{ key: 'A', text: 'Bite the bullet' }, { key: 'B', text: 'Burn the midnight oil' }, { key: 'C', text: 'Spill the beans' }, { key: 'D', text: 'Break the ice' }],
    correctAnswer: 'A',
    explanation: '"Bite the bullet" means to endure a painful or difficult situation bravely.'
  },
  {
    sectionIndex: 0,
    questionNumber: 6,
    questionText: 'Select the one-word substitution: "A person who loves books".',
    options: [{ key: 'A', text: 'Bibliophile' }, { key: 'B', text: 'Philanthropist' }, { key: 'C', text: 'Misogynist' }, { key: 'D', text: 'Polyglot' }],
    correctAnswer: 'A',
    explanation: 'A bibliophile is a person who collects or has a great love of books.'
  },
  {
    sectionIndex: 0,
    questionNumber: 7,
    questionText: 'Change into passive voice: "The manager approved the project."',
    options: [{ key: 'A', text: 'The project is approved by the manager.' }, { key: 'B', text: 'The project was approved by the manager.' }, { key: 'C', text: 'The project had been approved by the manager.' }, { key: 'D', text: 'The manager was approving the project.' }],
    correctAnswer: 'B',
    explanation: 'Past simple active "approved" changes to "was approved" in passive voice.'
  },
  {
    sectionIndex: 0,
    questionNumber: 8,
    questionText: 'Find the error in: "She is senior than me in the organization."',
    options: [{ key: 'A', text: 'She is' }, { key: 'B', text: 'senior than' }, { key: 'C', text: 'me in' }, { key: 'D', text: 'the organization' }],
    correctAnswer: 'B',
    explanation: 'Adjectives like senior, junior, superior take preposition "to" instead of "than" (senior to me).'
  },
  {
    sectionIndex: 0,
    questionNumber: 9,
    questionText: 'Select the synonym of "Obsolete".',
    options: [{ key: 'A', text: 'Modern' }, { key: 'B', text: 'Outdated' }, { key: 'C', text: 'Recent' }, { key: 'D', text: 'Vast' }],
    correctAnswer: 'B',
    explanation: 'Obsolete means no longer produced or used; out of date.'
  },
  {
    sectionIndex: 0,
    questionNumber: 10,
    questionText: 'Fill in: The teacher warned him _____ repeating the mistake.',
    options: [{ key: 'A', text: 'against' }, { key: 'B', text: 'for' }, { key: 'C', text: 'with' }, { key: 'D', text: 'about to' }],
    correctAnswer: 'A',
    explanation: 'The verb "warn" is followed by "against" when cautioning not to do something.'
  },

  // Reasoning
  {
    sectionIndex: 1,
    questionNumber: 11,
    questionText: 'Find the missing number in series: 2, 4, 8, 16, ?',
    options: [{ key: 'A', text: '24' }, { key: 'B', text: '30' }, { key: 'C', text: '32' }, { key: 'D', text: '64' }],
    correctAnswer: 'C',
    explanation: 'Pattern: Multiply previous number by 2. 16 * 2 = 32.'
  },
  {
    sectionIndex: 1,
    questionNumber: 12,
    questionText: 'If CAT is coded as 3120, how is DOG coded?',
    options: [{ key: 'A', text: '4157' }, { key: 'B', text: '4147' }, { key: 'C', text: '4158' }, { key: 'D', text: '3157' }],
    correctAnswer: 'A',
    explanation: 'Letter alphabetical positions: D=4, O=15, G=7 -> 4157.'
  },
  {
    sectionIndex: 1,
    questionNumber: 13,
    questionText: 'Select the related word pair: Doctor : Hospital :: Teacher : ?',
    options: [{ key: 'A', text: 'Office' }, { key: 'B', text: 'School' }, { key: 'C', text: 'Court' }, { key: 'D', text: 'Library' }],
    correctAnswer: 'B',
    explanation: 'Doctor works in a hospital; Teacher works in a school.'
  },
  {
    sectionIndex: 1,
    questionNumber: 14,
    questionText: 'Find the odd one out:',
    options: [{ key: 'A', text: 'Apple' }, { key: 'B', text: 'Banana' }, { key: 'C', text: 'Potato' }, { key: 'D', text: 'Mango' }],
    correctAnswer: 'C',
    explanation: 'Potato is a vegetable/tuber, while Apple, Banana, and Mango are fruits.'
  },
  {
    sectionIndex: 1,
    questionNumber: 15,
    questionText: 'If A is the father of B, and B is the mother of C, how is A related to C?',
    options: [{ key: 'A', text: 'Father' }, { key: 'B', text: 'Maternal Grandfather' }, { key: 'C', text: 'Uncle' }, { key: 'D', text: 'Brother' }],
    correctAnswer: 'B',
    explanation: 'Mother\'s father is the maternal grandfather.'
  },
  {
    sectionIndex: 1,
    questionNumber: 16,
    questionText: 'Find the missing term: B, D, F, H, ?',
    options: [{ key: 'A', text: 'I' }, { key: 'B', text: 'J' }, { key: 'C', text: 'K' }, { key: 'D', text: 'L' }],
    correctAnswer: 'B',
    explanation: 'Skip one letter each time (+2): B(2), D(4), F(6), H(8), J(10).'
  },
  {
    sectionIndex: 1,
    questionNumber: 17,
    questionText: 'Facing North, Rahul walks 10m, turns right and walks 5m. Which direction is he facing?',
    options: [{ key: 'A', text: 'North' }, { key: 'B', text: 'East' }, { key: 'C', text: 'South' }, { key: 'D', text: 'West' }],
    correctAnswer: 'B',
    explanation: 'Turning right from North faces East.'
  },
  {
    sectionIndex: 1,
    questionNumber: 18,
    questionText: 'Which letter replaces question mark? ACE, GIK, MOQ, ?',
    options: [{ key: 'A', text: 'SUW' }, { key: 'B', text: 'RTV' }, { key: 'C', text: 'TXZ' }, { key: 'D', text: 'SUV' }],
    correctAnswer: 'A',
    explanation: 'Each block steps by 2 letters. M(13)+6=S(19), O(15)+6=U(21), Q(17)+6=W(23) -> SUW.'
  },
  {
    sectionIndex: 1,
    questionNumber: 19,
    questionText: 'In a class of 30 students, Amit ranks 10th from top. What is his rank from bottom?',
    options: [{ key: 'A', text: '20th' }, { key: 'B', text: '21st' }, { key: 'C', text: '22nd' }, { key: 'D', text: '19th' }],
    correctAnswer: 'B',
    explanation: 'Rank from bottom = (Total + 1) - Rank from top = (30 + 1) - 10 = 21.'
  },
  {
    sectionIndex: 1,
    questionNumber: 20,
    questionText: 'Choose the correct mirror image of term "EXAM":',
    options: [{ key: 'A', text: 'MAXE' }, { key: 'B', text: 'ƎXAM' }, { key: 'C', text: 'MAXƎ' }, { key: 'D', text: 'MAZE' }],
    correctAnswer: 'C',
    explanation: 'Mirror image reverses letter order and flips individual asymmetrical characters.'
  },

  // Mathematics
  {
    sectionIndex: 2,
    questionNumber: 21,
    questionText: 'What is 25% of 200?',
    options: [{ key: 'A', text: '25' }, { key: 'B', text: '40' }, { key: 'C', text: '50' }, { key: 'D', text: '75' }],
    correctAnswer: 'C',
    explanation: '(25 / 100) * 200 = 50.'
  },
  {
    sectionIndex: 2,
    questionNumber: 22,
    questionText: 'If the ratio of two numbers is 3:4 and their sum is 70, find the larger number.',
    options: [{ key: 'A', text: '30' }, { key: 'B', text: '40' }, { key: 'C', text: '50' }, { key: 'D', text: '60' }],
    correctAnswer: 'B',
    explanation: 'Sum parts = 3 + 4 = 7. 1 part = 70/7 = 10. Larger = 4 * 10 = 40.'
  },
  {
    sectionIndex: 2,
    questionNumber: 23,
    questionText: 'What is the average of first 5 natural numbers (1, 2, 3, 4, 5)?',
    options: [{ key: 'A', text: '2.5' }, { key: 'B', text: '3' }, { key: 'C', text: '3.5' }, { key: 'D', text: '4' }],
    correctAnswer: 'B',
    explanation: 'Sum = 15. Average = 15 / 5 = 3.'
  },
  {
    sectionIndex: 2,
    questionNumber: 24,
    questionText: 'A car covers a distance of 150 km in 3 hours. What is its speed in km/h?',
    options: [{ key: 'A', text: '45' }, { key: 'B', text: '50' }, { key: 'C', text: '55' }, { key: 'D', text: '60' }],
    correctAnswer: 'B',
    explanation: 'Speed = Distance / Time = 150 / 3 = 50 km/h.'
  },
  {
    sectionIndex: 2,
    questionNumber: 25,
    questionText: 'Find Simple Interest on ₹ 5000 at 10% per annum for 2 years.',
    options: [{ key: 'A', text: '₹ 500' }, { key: 'B', text: '₹ 1000' }, { key: 'C', text: '₹ 1200' }, { key: 'D', text: '₹ 1500' }],
    correctAnswer: 'B',
    explanation: 'SI = (P * R * T) / 100 = (5000 * 10 * 2) / 100 = ₹ 1000.'
  },
  {
    sectionIndex: 2,
    questionNumber: 26,
    questionText: 'If Cost Price is ₹ 80 and Selling Price is ₹ 100, what is the profit percentage?',
    options: [{ key: 'A', text: '20%' }, { key: 'B', text: '25%' }, { key: 'C', text: '30%' }, { key: 'D', text: '15%' }],
    correctAnswer: 'B',
    explanation: 'Profit = 100 - 80 = 20. Profit % = (20 / 80) * 100 = 25%.'
  },
  {
    sectionIndex: 2,
    questionNumber: 27,
    questionText: 'What is the HCF of 24 and 36?',
    options: [{ key: 'A', text: '6' }, { key: 'B', text: '12' }, { key: 'C', text: '18' }, { key: 'D', text: '72' }],
    correctAnswer: 'B',
    explanation: 'Factors of 24: 1,2,3,4,6,8,12,24. Factors of 36: 1,2,3,4,6,9,12,18,36. Highest common factor is 12.'
  },
  {
    sectionIndex: 2,
    questionNumber: 28,
    questionText: 'If 12 men can complete a work in 10 days, how many days will 15 men take to complete the same work?',
    options: [{ key: 'A', text: '6 days' }, { key: 'B', text: '8 days' }, { key: 'C', text: '9 days' }, { key: 'D', text: '10 days' }],
    correctAnswer: 'B',
    explanation: 'Man-days = 12 * 10 = 120. Days for 15 men = 120 / 15 = 8 days.'
  },
  {
    sectionIndex: 2,
    questionNumber: 29,
    questionText: 'Calculate the perimeter of a rectangle with length 15 cm and breadth 10 cm.',
    options: [{ key: 'A', text: '25 cm' }, { key: 'B', text: '50 cm' }, { key: 'C', text: '150 cm' }, { key: 'D', text: '100 cm' }],
    correctAnswer: 'B',
    explanation: 'Perimeter = 2 * (length + breadth) = 2 * (15 + 10) = 50 cm.'
  },
  {
    sectionIndex: 2,
    questionNumber: 30,
    questionText: 'Solve: 15 + 5 * 2 - 4 / 2 = ?',
    options: [{ key: 'A', text: '23' }, { key: 'B', text: '38' }, { key: 'C', text: '18' }, { key: 'D', text: '25' }],
    correctAnswer: 'A',
    explanation: 'Using BODMAS: Multiplication and division first -> 5*2=10, 4/2=2. Expression: 15 + 10 - 2 = 23.'
  },

  // General Awareness
  {
    sectionIndex: 3,
    questionNumber: 31,
    questionText: 'Who is known as the Father of the Indian Constitution?',
    options: [{ key: 'A', text: 'Mahatma Gandhi' }, { key: 'B', text: 'Dr. B.R. Ambedkar' }, { key: 'C', text: 'Jawaharlal Nehru' }, { key: 'D', text: 'Sardar Patel' }],
    correctAnswer: 'B',
    explanation: 'Dr. B.R. Ambedkar was the Chairman of the Drafting Committee of the Constitution of India.'
  },
  {
    sectionIndex: 3,
    questionNumber: 32,
    questionText: 'Which river is known as the "Sorrow of Bengal"?',
    options: [{ key: 'A', text: 'Ganga' }, { key: 'B', text: 'Yamuna' }, { key: 'C', text: 'Damodar River' }, { key: 'D', text: 'Kosi River' }],
    correctAnswer: 'C',
    explanation: 'Damodar River was formerly known as the Sorrow of Bengal due to devastating seasonal floods.'
  },
  {
    sectionIndex: 3,
    questionNumber: 33,
    questionText: 'What is the capital of India?',
    options: [{ key: 'A', text: 'Mumbai' }, { key: 'B', text: 'Kolkata' }, { key: 'C', text: 'New Delhi' }, { key: 'D', text: 'Chennai' }],
    correctAnswer: 'C',
    explanation: 'New Delhi is the official national capital of India.'
  },
  {
    sectionIndex: 3,
    questionNumber: 34,
    questionText: 'Which planet is known as the "Red Planet"?',
    options: [{ key: 'A', text: 'Venus' }, { key: 'B', text: 'Mars' }, { key: 'C', text: 'Jupiter' }, { key: 'D', text: 'Saturn' }],
    correctAnswer: 'B',
    explanation: 'Mars is called the Red Planet because of the iron oxide present on its surface.'
  },
  {
    sectionIndex: 3,
    questionNumber: 35,
    questionText: 'Which gas is most abundant in Earth\'s atmosphere?',
    options: [{ key: 'A', text: 'Oxygen' }, { key: 'B', text: 'Carbon Dioxide' }, { key: 'C', text: 'Nitrogen' }, { key: 'D', text: 'Hydrogen' }],
    correctAnswer: 'C',
    explanation: 'Nitrogen makes up approximately 78% of Earth\'s atmosphere.'
  },
  {
    sectionIndex: 3,
    questionNumber: 36,
    questionText: 'Who wrote the Indian National Anthem "Jana Gana Mana"?',
    options: [{ key: 'A', text: 'Bankim Chandra Chattopadhyay' }, { key: 'B', text: 'Rabindranath Tagore' }, { key: 'C', text: 'Sarojini Naidu' }, { key: 'D', text: 'Subhash Chandra Bose' }],
    correctAnswer: 'B',
    explanation: 'Rabindranath Tagore composed Jana Gana Mana originally in Bengali.'
  },
  {
    sectionIndex: 3,
    questionNumber: 37,
    questionText: 'Which fundamental right cannot be suspended even during a National Emergency?',
    options: [{ key: 'A', text: 'Right to Speech' }, { key: 'B', text: 'Right to Life and Personal Liberty (Article 21)' }, { key: 'C', text: 'Right to Equality' }, { key: 'D', text: 'Right to Freedom of Movement' }],
    correctAnswer: 'B',
    explanation: 'Articles 20 and 21 cannot be suspended even during emergency under Article 359.'
  },
  {
    sectionIndex: 3,
    questionNumber: 38,
    questionText: 'In which year did India gain independence?',
    options: [{ key: 'A', text: '1942' }, { key: 'B', text: '1947' }, { key: 'C', text: '1950' }, { key: 'D', text: '1952' }],
    correctAnswer: 'B',
    explanation: 'India gained independence from British rule on 15th August 1947.'
  },
  {
    sectionIndex: 3,
    questionNumber: 39,
    questionText: 'Which organ in the human body pumps blood?',
    options: [{ key: 'A', text: 'Lungs' }, { key: 'B', text: 'Kidney' }, { key: 'C', text: 'Heart' }, { key: 'D', text: 'Liver' }],
    correctAnswer: 'C',
    explanation: 'The heart is a muscular organ that pumps blood through the circulatory system.'
  },
  {
    sectionIndex: 3,
    questionNumber: 40,
    questionText: 'Who is the ex-officio Chairman of Rajya Sabha in India?',
    options: [{ key: 'A', text: 'Prime Minister' }, { key: 'B', text: 'President' }, { key: 'C', text: 'Vice-President of India' }, { key: 'D', text: 'Speaker of Lok Sabha' }],
    correctAnswer: 'C',
    explanation: 'The Vice-President of India acts as the ex-officio Chairman of the Rajya Sabha.'
  }
];

// Helper to check and initialize default Firestore data
export async function initializeFirestoreIfNeeded() {
  try {
    // 1. Check & seed default categories
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        await addDoc(collection(db, 'categories'), { ...cat, createdAt: new Date().toISOString() });
      }
    }

    // 2. Check & seed admin user
    const adminQ = query(collection(db, 'users'), where('email', '==', 'admin@examtest.com'));
    const adminSnap = await getDocs(adminQ);
    if (adminSnap.empty) {
      await addDoc(collection(db, 'users'), {
        ...DEFAULT_USERS[0],
        createdAt: new Date().toISOString()
      });
    }

    // 3. Check & seed default test
    const testSnap = await getDocs(collection(db, 'tests'));
    if (testSnap.empty) {
      const testRef = await addDoc(collection(db, 'tests'), {
        ...DEFAULT_TEST,
        createdAt: new Date().toISOString()
      });

      const sectionIds = [];
      for (let i = 0; i < DEFAULT_SECTIONS.length; i++) {
        const sec = DEFAULT_SECTIONS[i];
        const secRef = await addDoc(collection(db, 'sections'), {
          testId: testRef.id,
          name: sec.name,
          duration: sec.duration,
          order: sec.order,
          createdAt: new Date().toISOString()
        });
        sectionIds.push(secRef.id);
      }

      for (const q of DEFAULT_QUESTIONS) {
        const secId = sectionIds[q.sectionIndex];
        await addDoc(collection(db, 'questions'), {
          testId: testRef.id,
          sectionId: secId,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
  }
}

// -----------------------------------------------------------------
// AUTH & USERS (Firestore)
// -----------------------------------------------------------------

export async function fbLogin(email, password) {
  await initializeFirestoreIfNeeded();

  const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase().trim()));
  const snap = await getDocs(q);

  if (snap.empty) {
    // Fallback if users were not found, match default credentials
    const defaultUser = DEFAULT_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );
    if (defaultUser) {
      const newDoc = await addDoc(collection(db, 'users'), {
        ...defaultUser,
        createdAt: new Date().toISOString()
      });
      return { _id: newDoc.id, ...defaultUser, token: 'fb-token-' + newDoc.id };
    }
    throw new Error('Invalid email or password');
  }

  const userDoc = snap.docs[0];
  const userData = userDoc.data();

  if (userData.password !== password) {
    throw new Error('Invalid email or password');
  }

  if (userData.status === 'disabled') {
    throw new Error('Your account has been disabled by administrator.');
  }

  return {
    _id: userDoc.id,
    ...userData,
    token: 'fb-token-' + userDoc.id
  };
}

export async function fbRegister(userData) {
  await initializeFirestoreIfNeeded();

  const q = query(collection(db, 'users'), where('email', '==', userData.email.toLowerCase().trim()));
  const snap = await getDocs(q);

  if (!snap.empty) {
    throw new Error('User with this email already exists');
  }

  const newUser = {
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    phone: userData.phone || '',
    role: userData.role || 'user',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'users'), newUser);
  return {
    _id: docRef.id,
    ...newUser,
    token: 'fb-token-' + docRef.id
  };
}

export async function fbGetUsers(params = {}) {
  await initializeFirestoreIfNeeded();

  const snap = await getDocs(collection(db, 'users'));
  const users = [];

  for (const d of snap.docs) {
    const uData = d.data();
    const userId = d.id;

    // Search filter
    if (params.search) {
      const s = params.search.toLowerCase();
      if (!uData.name?.toLowerCase().includes(s) && !uData.email?.toLowerCase().includes(s)) {
        continue;
      }
    }

    // Get attempts count & average score
    const attQuery = query(collection(db, 'testAttempts'), where('userId', '==', userId));
    const attSnap = await getDocs(attQuery);
    const testsCompleted = attSnap.size;
    let avgScore = 0;
    if (testsCompleted > 0) {
      const sumPct = attSnap.docs.reduce((acc, curr) => acc + (curr.data().percentage || 0), 0);
      avgScore = Math.round(sumPct / testsCompleted);
    }

    users.push({
      _id: userId,
      ...uData,
      testsCompleted,
      avgScore
    });
  }

  return users;
}

export async function fbGetUserById(id) {
  const docRef = doc(db, 'users', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('User not found');

  const attQuery = query(collection(db, 'testAttempts'), where('userId', '==', id));
  const attSnap = await getDocs(attQuery);

  const attempts = attSnap.docs.map(d => ({ _id: d.id, ...d.data() }));

  return {
    user: { _id: snap.id, ...snap.data() },
    attempts
  };
}

export async function fbCreateUser(data) {
  return await fbRegister(data);
}

export async function fbUpdateUser(id, data) {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  const updated = await getDoc(docRef);
  return { _id: updated.id, ...updated.data() };
}

export async function fbDeleteUser(id) {
  await deleteDoc(doc(db, 'users', id));
  return { message: 'User deleted' };
}

// -----------------------------------------------------------------
// CATEGORIES (Firestore)
// -----------------------------------------------------------------

export async function fbGetCategories() {
  await initializeFirestoreIfNeeded();
  const snap = await getDocs(collection(db, 'categories'));
  return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
}

export async function fbCreateCategory(data) {
  const docRef = await addDoc(collection(db, 'categories'), {
    name: data.name.trim(),
    description: data.description || '',
    createdAt: new Date().toISOString()
  });
  return { _id: docRef.id, ...data };
}

export async function fbDeleteCategory(id) {
  await deleteDoc(doc(db, 'categories', id));
  return { message: 'Category deleted' };
}

// -----------------------------------------------------------------
// TESTS (Firestore)
// -----------------------------------------------------------------

export async function fbGetAvailableTests(params = {}) {
  await initializeFirestoreIfNeeded();

  const snap = await getDocs(collection(db, 'tests'));
  const tests = [];

  for (const d of snap.docs) {
    const t = d.data();
    if (t.status !== 'Published') continue;

    if (params.category && t.category !== params.category) continue;
    if (params.search && !t.title?.toLowerCase().includes(params.search.toLowerCase())) continue;

    // Load sections
    const secQ = query(collection(db, 'sections'), where('testId', '==', d.id));
    const secSnap = await getDocs(secQ);
    const sections = secSnap.docs.map(s => ({ _id: s.id, ...s.data() }));
    sections.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Load questions count
    const qQ = query(collection(db, 'questions'), where('testId', '==', d.id));
    const qSnap = await getDocs(qQ);

    tests.push({
      _id: d.id,
      ...t,
      totalQuestions: qSnap.size || t.totalQuestions || 0,
      sections: sections.map(s => s.name),
      sectionDetails: sections
    });
  }

  return tests;
}

export async function fbGetAllTestsAdmin(params = {}) {
  await initializeFirestoreIfNeeded();

  const snap = await getDocs(collection(db, 'tests'));
  const tests = [];

  for (const d of snap.docs) {
    const t = d.data();

    if (params.status && t.status !== params.status) continue;
    if (params.category && t.category !== params.category) continue;
    if (params.search && !t.title?.toLowerCase().includes(params.search.toLowerCase())) continue;

    const qQ = query(collection(db, 'questions'), where('testId', '==', d.id));
    const qSnap = await getDocs(qQ);

    const attQ = query(collection(db, 'testAttempts'), where('testId', '==', d.id));
    const attSnap = await getDocs(attQ);

    tests.push({
      _id: d.id,
      ...t,
      totalQuestions: qSnap.size || t.totalQuestions || 0,
      attemptsCount: attSnap.size || 0
    });
  }

  return tests;
}

export async function fbGetTestForAttempt(testId) {
  const testRef = doc(db, 'tests', testId);
  const testSnap = await getDoc(testRef);
  if (!testSnap.exists()) throw new Error('Test not found');

  const testData = testSnap.data();
  if (testData.status !== 'Published') {
    throw new Error('This test is not published yet.');
  }

  const secQ = query(collection(db, 'sections'), where('testId', '==', testId));
  const secSnap = await getDocs(secQ);
  const sections = secSnap.docs.map(s => ({ _id: s.id, ...s.data() }));
  sections.sort((a, b) => (a.order || 0) - (b.order || 0));

  const qQ = query(collection(db, 'questions'), where('testId', '==', testId));
  const qSnap = await getDocs(qQ);

  // SANITIZE: EXCLUDE correctAnswer and explanation for security!
  const sanitizedQuestions = qSnap.docs.map(qd => {
    const q = qd.data();
    return {
      _id: qd.id,
      testId: q.testId,
      sectionId: q.sectionId,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      options: q.options
    };
  });
  sanitizedQuestions.sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));

  return {
    test: {
      _id: testSnap.id,
      title: testData.title,
      category: testData.category,
      description: testData.description,
      totalQuestions: sanitizedQuestions.length,
      totalDuration: testData.totalDuration
    },
    sections,
    questions: sanitizedQuestions
  };
}

export async function fbGetTestByIdAdmin(testId) {
  const testRef = doc(db, 'tests', testId);
  const testSnap = await getDoc(testRef);
  if (!testSnap.exists()) throw new Error('Test not found');

  const secQ = query(collection(db, 'sections'), where('testId', '==', testId));
  const secSnap = await getDocs(secQ);
  const sections = secSnap.docs.map(s => ({ _id: s.id, ...s.data() }));
  sections.sort((a, b) => (a.order || 0) - (b.order || 0));

  const qQ = query(collection(db, 'questions'), where('testId', '==', testId));
  const qSnap = await getDocs(qQ);
  const questions = qSnap.docs.map(qd => ({ _id: qd.id, ...qd.data() }));
  questions.sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));

  return {
    test: { _id: testSnap.id, ...testSnap.data() },
    sections,
    questions
  };
}

export async function fbCreateTest(testData) {
  const docRef = await addDoc(collection(db, 'tests'), {
    title: testData.title.trim(),
    category: testData.category.trim(),
    description: testData.description || '',
    status: testData.status || 'Draft',
    totalQuestions: 0,
    totalDuration: 0,
    createdAt: new Date().toISOString()
  });
  return { _id: docRef.id, ...testData };
}

export async function fbUpdateTest(testId, data) {
  const docRef = doc(db, 'tests', testId);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  const updated = await getDoc(docRef);
  return { _id: updated.id, ...updated.data() };
}

export async function fbTogglePublishTest(testId) {
  const docRef = doc(db, 'tests', testId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Test not found');

  const current = snap.data();
  const nextStatus = current.status === 'Published' ? 'Unpublished' : 'Published';
  await updateDoc(docRef, { status: nextStatus, updatedAt: new Date().toISOString() });

  return { message: `Test ${nextStatus.toLowerCase()} successfully`, status: nextStatus };
}

export async function fbDeleteTest(testId) {
  // Delete associated sections
  const secQ = query(collection(db, 'sections'), where('testId', '==', testId));
  const secSnap = await getDocs(secQ);
  for (const s of secSnap.docs) {
    await deleteDoc(doc(db, 'sections', s.id));
  }

  // Delete associated questions
  const qQ = query(collection(db, 'questions'), where('testId', '==', testId));
  const qSnap = await getDocs(qQ);
  for (const q of qSnap.docs) {
    await deleteDoc(doc(db, 'questions', q.id));
  }

  // Delete test
  await deleteDoc(doc(db, 'tests', testId));
  return { message: 'Test and associated questions deleted successfully' };
}

export async function fbDeleteQuestion(id) {
  await deleteDoc(doc(db, 'questions', id));
  return { message: 'Question deleted' };
}

export async function fbDuplicateTest(testId) {
  const original = await fbGetTestByIdAdmin(testId);

  const newTestRef = await addDoc(collection(db, 'tests'), {
    title: `${original.test.title} (Copy)`,
    category: original.test.category,
    description: original.test.description || '',
    status: 'Draft',
    totalQuestions: original.test.totalQuestions || 0,
    totalDuration: original.test.totalDuration || 0,
    createdAt: new Date().toISOString()
  });

  const sectionMap = {};
  for (const sec of original.sections) {
    const newSec = await addDoc(collection(db, 'sections'), {
      testId: newTestRef.id,
      name: sec.name,
      duration: sec.duration,
      order: sec.order,
      createdAt: new Date().toISOString()
    });
    sectionMap[sec._id] = newSec.id;
  }

  for (const q of original.questions) {
    await addDoc(collection(db, 'questions'), {
      testId: newTestRef.id,
      sectionId: sectionMap[q.sectionId] || '',
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      createdAt: new Date().toISOString()
    });
  }

  return { _id: newTestRef.id, title: `${original.test.title} (Copy)` };
}

export async function fbSaveParsedTest(payload) {
  const { title, category, description, status, sections } = payload;

  const testRef = await addDoc(collection(db, 'tests'), {
    title: title.trim(),
    category: category.trim(),
    description: description || '',
    status: status || 'Draft',
    totalQuestions: 0,
    totalDuration: 0,
    createdAt: new Date().toISOString()
  });

  let totalQCount = 0;
  let totalDur = 0;

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const sec = sections[sIdx];
    const dur = parseInt(sec.duration, 10) || 15;
    totalDur += dur;

    const secRef = await addDoc(collection(db, 'sections'), {
      testId: testRef.id,
      name: sec.name || `Section ${sIdx + 1}`,
      duration: dur,
      order: sIdx + 1,
      createdAt: new Date().toISOString()
    });

    if (sec.questions && Array.isArray(sec.questions)) {
      for (const q of sec.questions) {
        totalQCount++;
        await addDoc(collection(db, 'questions'), {
          testId: testRef.id,
          sectionId: secRef.id,
          questionNumber: q.questionNumber || totalQCount,
          questionText: q.questionText,
          options: q.options || [],
          correctAnswer: (q.correctAnswer || 'A').toUpperCase(),
          explanation: q.explanation || '',
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  await updateDoc(doc(db, 'tests', testRef.id), {
    totalQuestions: totalQCount,
    totalDuration: totalDur
  });

  return { message: 'Test saved successfully in Firebase!', testId: testRef.id };
}

// -----------------------------------------------------------------
// PDF FILE UPLOAD (Firebase Storage) & Text Parsing
// -----------------------------------------------------------------

export async function fbUploadPdfFile(file) {
  // 1. Upload to Firebase Storage
  const storagePath = `question_pdfs/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(fileRef);

  // 2. Extract text from PDF file in browser using pdfjs-dist
  let extractedText = '';
  try {
    const pdfjsLib = await import('pdfjs-dist/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      extractedText += pageText + '\n';
    }
  } catch (err) {
    console.warn('Browser PDF text extraction fallback:', err.message);
  }

  // Parse structured text
  const parsedData = parseQuestionPaperText(extractedText || file.name);

  return {
    message: 'PDF uploaded to Firebase Storage successfully.',
    storageUrl: downloadUrl,
    parsedData
  };
}

export function parseQuestionPaperText(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let testTitle = 'Imported Mock Test 01';
  let category = 'SSC';
  let sections = [];
  let currentSection = {
    name: 'General Section',
    duration: 30,
    questions: []
  };

  let currentQuestion = null;

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    if (/^TEST\s*NAME\s*:\s*/i.test(line)) {
      testTitle = line.replace(/^TEST\s*NAME\s*:\s*/i, '').trim();
    } else if (/^CATEGORY\s*:\s*/i.test(line)) {
      category = line.replace(/^CATEGORY\s*:\s*/i, '').trim();
    }
  }

  const flushQuestion = () => {
    if (currentQuestion && currentQuestion.questionText) {
      if (!currentQuestion.correctAnswer) currentQuestion.correctAnswer = 'A';
      currentSection.questions.push({ ...currentQuestion });
      currentQuestion = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const sectionMatch = line.match(/^SECTION(?:\s+\d+)?\s*:\s*(.+)$/i);
    if (sectionMatch) {
      flushQuestion();
      if (currentSection.questions.length > 0) sections.push({ ...currentSection });
      currentSection = { name: sectionMatch[1].trim(), duration: 15, questions: [] };
      continue;
    }

    const timeMatch = line.match(/^(?:TIME|DURATION)\s*:\s*(\d+)/i);
    if (timeMatch) {
      currentSection.duration = parseInt(timeMatch[1], 10) || 15;
      continue;
    }

    const qMatch = line.match(/^(?:Q|QUESTION)?\s*(\d+)[\.\:]\s*(.+)$/i);
    if (qMatch && !line.match(/^(?:ANSWER|ANS)\s*:/i)) {
      flushQuestion();
      currentQuestion = {
        questionNumber: parseInt(qMatch[1], 10),
        questionText: qMatch[2].trim(),
        options: [],
        correctAnswer: 'A',
        explanation: ''
      };
      continue;
    }

    const optMatch = line.match(/^(?:\(?([A-D])\)?[\.\)]\s*)(.+)$/i);
    if (optMatch && currentQuestion) {
      const key = optMatch[1].toUpperCase();
      const textVal = optMatch[2].trim();
      currentQuestion.options.push({ key, text: textVal });
      continue;
    }

    const ansMatch = line.match(/^(?:ANSWER|ANS|CORRECT\s*ANSWER)\s*:\s*([A-D])/i);
    if (ansMatch && currentQuestion) {
      currentQuestion.correctAnswer = ansMatch[1].toUpperCase();
      continue;
    }

    const expMatch = line.match(/^(?:EXPLANATION|EXPLAIN)\s*:\s*(.+)$/i);
    if (expMatch && currentQuestion) {
      currentQuestion.explanation = expMatch[1].trim();
      continue;
    }

    if (currentQuestion) {
      if (currentQuestion.options.length === 0) {
        currentQuestion.questionText += ' ' + line;
      }
    }
  }

  flushQuestion();
  if (currentSection.questions.length > 0) sections.push({ ...currentSection });

  if (sections.length === 0) {
    sections.push({ name: 'General Section', duration: 30, questions: [] });
  }

  return { testTitle, category, sections, rawText: text };
}

// -----------------------------------------------------------------
// TEST ATTEMPTS & EVALUATION (Firestore)
// -----------------------------------------------------------------

export async function fbSubmitTestAttempt(payload, currentUser) {
  const { testId, answers, startedAt, sectionTimeSpent } = payload;

  const testRef = doc(db, 'tests', testId);
  const testSnap = await getDoc(testRef);
  if (!testSnap.exists()) throw new Error('Test not found');
  const testData = testSnap.data();

  // Load actual questions with correct answers from Firestore
  const qQ = query(collection(db, 'questions'), where('testId', '==', testId));
  const qSnap = await getDocs(qQ);
  const questions = qSnap.docs.map(d => ({ _id: d.id, ...d.data() }));

  const secQ = query(collection(db, 'sections'), where('testId', '==', testId));
  const secSnap = await getDocs(secQ);
  const sections = secSnap.docs.map(d => ({ _id: d.id, ...d.data() }));

  const userAnswersMap = {};
  if (Array.isArray(answers)) {
    answers.forEach(item => {
      if (item.questionId) userAnswersMap[item.questionId] = item;
    });
  } else if (typeof answers === 'object' && answers !== null) {
    Object.keys(answers).forEach(qId => {
      userAnswersMap[qId] = {
        questionId: qId,
        selectedOption: typeof answers[qId] === 'string' ? answers[qId] : answers[qId]?.selectedOption,
        status: answers[qId]?.status || 'answered'
      };
    });
  }

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  const processedAnswers = [];
  const sectionStatsMap = {};

  sections.forEach(sec => {
    sectionStatsMap[sec._id] = {
      sectionId: sec._id,
      sectionName: sec.name,
      score: 0,
      maxScore: 0,
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: 0,
      timeSpentSeconds: (sectionTimeSpent && sectionTimeSpent[sec._id]) || 0
    };
  });

  questions.forEach(q => {
    const qIdStr = q._id;
    const secIdStr = q.sectionId;
    const userAns = userAnswersMap[qIdStr];

    const selected = userAns?.selectedOption ? userAns.selectedOption.trim().toUpperCase() : null;
    const qStatus = userAns ? (userAns.status || (selected ? 'answered' : 'unanswered')) : 'unanswered';

    let isCorrect = false;

    if (!selected) {
      unansweredCount++;
      if (sectionStatsMap[secIdStr]) {
        sectionStatsMap[secIdStr].unansweredCount++;
        sectionStatsMap[secIdStr].maxScore += 1;
      }
    } else if (selected === q.correctAnswer.toUpperCase()) {
      isCorrect = true;
      correctCount++;
      if (sectionStatsMap[secIdStr]) {
        sectionStatsMap[secIdStr].correctCount++;
        sectionStatsMap[secIdStr].score += 1;
        sectionStatsMap[secIdStr].maxScore += 1;
      }
    } else {
      wrongCount++;
      if (sectionStatsMap[secIdStr]) {
        sectionStatsMap[secIdStr].wrongCount++;
        sectionStatsMap[secIdStr].maxScore += 1;
      }
    }

    processedAnswers.push({
      questionId: q._id,
      selectedOption: selected,
      status: qStatus,
      isCorrect,
      correctOption: q.correctAnswer
    });
  });

  const totalQuestions = questions.length;
  const score = correctCount;
  const maxScore = totalQuestions;
  const percentage = maxScore > 0 ? parseFloat(((score / maxScore) * 100).toFixed(2)) : 0;

  const startTime = startedAt ? new Date(startedAt) : new Date(Date.now() - 60000);
  const endTime = new Date();
  const timeTakenSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

  const sectionResults = Object.values(sectionStatsMap);

  const attemptDoc = {
    userId: currentUser?._id || 'guest',
    userName: currentUser?.name || 'Candidate',
    userEmail: currentUser?.email || 'student@exam.com',
    testId: testId,
    testTitle: testData.title,
    testCategory: testData.category,
    startedAt: startTime.toISOString(),
    completedAt: endTime.toISOString(),
    timeTakenSeconds,
    answers: processedAnswers,
    score,
    maxScore,
    percentage,
    correctCount,
    wrongCount,
    unansweredCount,
    sectionResults,
    createdAt: new Date().toISOString()
  };

  const attRef = await addDoc(collection(db, 'testAttempts'), attemptDoc);

  return {
    message: 'Test submitted and saved in Firebase!',
    attemptId: attRef.id,
    attempt: { _id: attRef.id, ...attemptDoc, testId: { _id: testId, ...testData } }
  };
}

export async function fbGetUserHistory(userId) {
  await initializeFirestoreIfNeeded();

  const q = query(collection(db, 'testAttempts'), where('userId', '==', userId));
  const snap = await getDocs(q);

  const attempts = snap.docs.map(d => {
    const data = d.data();
    return {
      _id: d.id,
      ...data,
      testId: {
        _id: data.testId,
        title: data.testTitle || 'Mock Test',
        category: data.testCategory || 'Exam',
        totalQuestions: data.maxScore
      }
    };
  });

  attempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  return attempts;
}

export async function fbGetAttemptDetails(attemptId) {
  const attRef = doc(db, 'testAttempts', attemptId);
  const attSnap = await getDoc(attRef);
  if (!attSnap.exists()) throw new Error('Attempt not found');

  const attemptData = attSnap.data();

  // Load questions for review
  const qQ = query(collection(db, 'questions'), where('testId', '==', attemptData.testId));
  const qSnap = await getDocs(qQ);
  const questions = qSnap.docs.map(d => ({ _id: d.id, ...d.data() }));

  const secQ = query(collection(db, 'sections'), where('testId', '==', attemptData.testId));
  const secSnap = await getDocs(secQ);
  const sections = secSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
  const secNameMap = {};
  sections.forEach(s => { secNameMap[s._id] = s.name; });

  const reviewData = questions.map(q => {
    const userAns = attemptData.answers?.find(a => a.questionId === q._id);
    return {
      _id: q._id,
      sectionName: secNameMap[q.sectionId] || 'General',
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      userSelectedOption: userAns ? userAns.selectedOption : null,
      userStatus: userAns ? userAns.status : 'unanswered',
      isCorrect: userAns ? userAns.isCorrect : false
    };
  });
  reviewData.sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));

  return {
    attempt: {
      _id: attSnap.id,
      ...attemptData,
      testId: {
        _id: attemptData.testId,
        title: attemptData.testTitle,
        category: attemptData.testCategory
      }
    },
    reviewData
  };
}

export async function fbGetAdminTestResults() {
  await initializeFirestoreIfNeeded();

  const snap = await getDocs(collection(db, 'testAttempts'));
  const results = snap.docs.map(d => {
    const data = d.data();
    return {
      _id: d.id,
      ...data,
      userId: { name: data.userName, email: data.userEmail },
      testId: { title: data.testTitle, category: data.testCategory }
    };
  });
  results.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  return results;
}

export async function fbGetAdminDashboardStats() {
  await initializeFirestoreIfNeeded();

  const userSnap = await getDocs(collection(db, 'users'));
  const totalUsers = userSnap.docs.filter(d => d.data().role === 'user').length;

  const testSnap = await getDocs(collection(db, 'tests'));
  const totalTests = testSnap.size;

  const qSnap = await getDocs(collection(db, 'questions'));
  const totalQuestions = qSnap.size;

  const attSnap = await getDocs(collection(db, 'testAttempts'));
  const testsCompleted = attSnap.size;

  let averageScore = 0;
  if (testsCompleted > 0) {
    const sumPct = attSnap.docs.reduce((acc, curr) => acc + (curr.data().percentage || 0), 0);
    averageScore = Math.round(sumPct / testsCompleted);
  }

  const attempts = attSnap.docs.map(d => {
    const data = d.data();
    return {
      _id: d.id,
      ...data,
      userId: { name: data.userName, email: data.userEmail },
      testId: { title: data.testTitle, category: data.testCategory }
    };
  });
  attempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  const recentAttempts = attempts.slice(0, 5);

  const categoryCounts = {};
  testSnap.docs.forEach(d => {
    const cat = d.data().category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryBreakdown = Object.keys(categoryCounts).map(k => ({ _id: k, count: categoryCounts[k] }));

  return {
    totalUsers,
    totalTests,
    totalQuestions,
    testsCompleted,
    averageScore,
    recentAttempts,
    categoryBreakdown
  };
}
