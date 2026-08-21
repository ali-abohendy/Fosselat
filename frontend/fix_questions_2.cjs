const fs = require('fs');

let data = JSON.parse(fs.readFileSync('public/questions.json', 'utf8'));
let totalFixed = 0;

for (const track of data.tracks) {
  for (const prog of track.programs) {
    if (!prog.levelBanks) continue;
    
    // levelBanks is an object mapping level ID to array of questions
    for (const [levelIdStr, bank] of Object.entries(prog.levelBanks)) {
      const levelId = parseInt(levelIdStr, 10);
      const newQuestions = [];
      const seenPrompts = new Set();
      
      const questions = bank.questions || [];
      for (let q of questions) {
        let skip = false;
        let originalPrompt = q.prompt;
        
        // 1. READING AND TAJWEED - LEVEL 1
        if (track.id === 'quran' && prog.id === 'reading-tajweed' && levelId === 0) {
          if (q.prompt && q.prompt.includes('Which letter is at the beginning')) {
            console.log('Found matching prompt:', q.prompt);
            const letterMap = {
              'ب': 'Baa',
              'ت': 'Taa',
              'ث': 'Thaa',
              'ن': 'Noon',
              'م': 'Meem',
              'س': 'Seen',
              'ش': 'Sheen',
              'ل': 'Laam',
              'ك': 'Kaaf',
              'ي': 'Yaa',
              'أ': 'Alif / Hamzah',
              'ع': 'Ayn',
              'ح': 'Haa',
              'خ': 'Khaa',
              'ج': 'Jeem',
              'ر': 'Raa',
              'ز': 'Zaay',
              'د': 'Daal',
              'ذ': 'Thaal',
              'ص': 'Saad',
              'ض': 'Daad',
              'ط': 'Taa',
              'ظ': 'Thaa',
              'ف': 'Fa',
              'ق': 'Qaaf',
              'ه': 'Haa',
              'هـ': 'Haa',
              'ة': 'Taa Marbootah',
              'و': 'Waaw',
              'غ': 'Ghayn'
            };
            if (q.options) {
              q.options = q.options.map(opt => letterMap[opt.trim()] || opt);
              q.optionsArabic = false;
            }
          }
          
          if (q.prompt && q.prompt.includes('How is this word read') && q.arabic && q.arabic.includes('عَمَل')) {
            if (q.options) {
              q.options = q.options.map(opt => {
                if (opt.toLowerCase().includes("'")) return 'A-M-U-L';
                if (opt === 'A-M-A-L-U') return 'A-M-I-L';
                return opt;
              });
            }
          }
        }
        
        // 3. READING AND TAJWEED - LEVEL 4
        if (track.id === 'quran' && prog.id === 'reading-tajweed' && levelId === 3) {
          if (q.prompt && q.prompt.includes('above a letter in the mushaf') || q.prompt.includes('written above a word in the mushaf')) {
            if (seenPrompts.has('mushaf_sign')) skip = true;
            else seenPrompts.add('mushaf_sign');
          }
          if (q.prompt && q.prompt.includes('Madd Munfasil')) {
            q.options = q.options.map(opt => opt === '4 or 5' ? '2, 4, or 5' : opt);
          }
          if (q.prompt && q.prompt.includes('deepest part of the throat')) {
            q.options = q.options.map(opt => (opt === 'Haa' || opt === 'Haa (هـ)' || opt.includes('Haa')) ? 'Ayn' : opt);
          }
        }
        
        // 8, 9, 10, 11: MEMORIZATION AND REVISION - BLANK QUESTIONS
        if (track.id === 'quran' && prog.id === 'memorization') {
          if (levelId === 0) {
            if (q.prompt && q.prompt.includes('آمنوا وعملوا الصالحات وتواصوا __ وتواصوا بالصبر')) {
              q.prompt = q.prompt.replace('آمنوا وعملوا الصالحات', 'إلا الذين آمنوا وعملوا الصالحات');
            }
          }
          if (levelId === 1) {
            if (q.prompt && q.prompt.includes('على الأرائك لا يرون فيها شمسا')) {
              q.prompt = q.prompt.replace('على الأرائك', 'متكئين فيها على الأرائك');
            }
            if (q.prompt && q.prompt.includes('الذين ضل سعيهم')) {
              q.prompt = 'الذين ضل سعيهم في الحياة الدنيا وهم يحسبون أنهم يحسنون صنعا';
            }
            if (q.prompt && q.prompt.includes('من لم يزده ماله وولده إلا خسارة')) {
              q.prompt = q.prompt.replace('من لم يزده', 'واتبعوا من لم يزده');
            }
            if (q.prompt && q.prompt.includes('خلقه قال من يحيي العظام وهي رميم')) {
              q.prompt = q.prompt.replace('خلقه قال', 'وضرب لنا مثلا ونسي خلقه قال');
            }
          }
          if (levelId === 2) {
            if (q.prompt && q.prompt.includes('يعرف المجرمون بسيماهم')) {
              if (seenPrompts.has('يعرف المجرمون')) skip = true;
              else seenPrompts.add('يعرف المجرمون');
            }
            if (q.prompt && q.prompt.includes('خالدين فيها أبدا قد أحسن الله له')) {
              if (!q.prompt.includes('رزقا')) {
                q.prompt = 'خالدين فيها أبدا قد أحسن الله له رزقا';
              }
            }
            if (q.prompt && q.prompt.includes('عنه سيئاته ويدخله جنات')) {
              q.prompt = q.prompt.replace('جنات', 'جنات تجري من تحتها الأنهار');
            }
          }
          if (levelId === 3) {
            if (q.prompt && q.prompt.includes('من ورائه جهنم ويسقى من ماء')) {
              q.prompt = q.prompt.replace('من ماء', 'من ماء صديد');
            }
            if (q.prompt && q.prompt.includes('ما يتقون إن الله بكل شيء عليم')) {
              q.prompt = 'وما كان الله ليضل قوما بعد إذ هداهم حتى يبين لهم ما يتقون إن الله بكل شيء عليم';
            }
          }
        }
        
        // 13. ARABIC FOUNDATION - LEVEL 1
        if (track.id === 'arabic' && prog.id === 'arabic-foundation' && levelId === 0) {
          if (q.prompt && q.prompt.includes('Which letter adds at the end of')) {
            const letterMap = {
              'ة': 'Taa Marbootah',
              'ه': 'Haa',
              'ت': 'Taa',
              'ا': 'Alif'
            };
            if (q.options) {
              q.options = q.options.map(opt => letterMap[opt.trim()] || opt);
              q.optionsArabic = false;
            }
          }
        }
        
        // 14. ARABIC FOUNDATION - LEVEL 2
        if (track.id === 'arabic' && (prog.id === 'arabic-foundation' || prog.id === 'arabic-post-foundation') && levelId === 1) {
          if (q.prompt && q.prompt.includes('How is this read')) {
            if (q.arabic && q.arabic.trim() === 'سْ') {
              q.arabic = 'أَسْ';
              q.options = q.options.map(opt => {
                if (opt === 'S' || opt === 'Sa') return 'As';
                if (opt === 'Si') return 'Is';
                if (opt === 'Su') return 'Us';
                return opt;
              });
            }
          }
        }
        
        if (!skip) {
          newQuestions.push(q);
        }
        
        if (skip || q.prompt !== originalPrompt) {
          totalFixed++;
        }
      }
      
      bank.questions = newQuestions;
    }
  }
}

fs.writeFileSync('public/questions_fixed.json', JSON.stringify(data, null, 1));
console.log(totalFixed + ' questions modified or removed.');
