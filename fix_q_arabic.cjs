const fs = require('fs');

let data = JSON.parse(fs.readFileSync('frontend/public/questions.json', 'utf8'));

// Fix Arabic Foundation Level 1 and 2
for (let track of data.tracks) {
  if (track.id === 'arabic') {
    for (let prog of track.programs) {
      if (prog.id === 'arabic-foundation-pathway') {
        // Level 1 Fix: English letter names for "adds at the end"
        if (prog.levelBanks['0'] && prog.levelBanks['0'].questions) {
          for (let q of prog.levelBanks['0'].questions) {
            if (q.prompt && q.prompt.includes('adds at the end of')) {
              // Convert options to English names
              const mapping = {
                'ب': 'Baa', 'ت': 'Taa', 'ث': 'Thaa', 'ن': 'Noon', 'م': 'Meem',
                'س': 'Seen', 'ش': 'Sheen', 'ل': 'Laam', 'ك': 'Kaaf', 'ي': 'Yaa',
                'أ': 'Alif / Hamzah', 'ع': 'Ayn', 'ح': 'Haa', 'خ': 'Khaa', 'ج': 'Jeem',
                'ر': 'Raa', 'ز': 'Zaay', 'د': 'Daal', 'ذ': 'Thaal', 'ص': 'Saad',
                'ض': 'Daad', 'ط': 'Taa', 'ظ': 'Thaa', 'ف': 'Fa', 'ق': 'Qaaf',
                'ه': 'Haa', 'و': 'Waw', 'غ': 'Ghayn'
              };
              if (q.options) {
                q.options = q.options.map(opt => mapping[opt.trim()] || opt);
                if (q.correctAnswer) {
                  q.correctAnswer = mapping[q.correctAnswer.trim()] || q.correctAnswer;
                }
              }
              // Disable optionsArabic so it renders left-to-right correctly
              q.optionsArabic = false;
            }
          }
        }
        
        // Level 2 Fix: Sukoon questions need preceding vowel (e.g. أَسْ)
        if (prog.levelBanks['1'] && prog.levelBanks['1'].questions) {
          for (let q of prog.levelBanks['1'].questions) {
            if (q.prompt && q.prompt.includes('How is this read?')) {
              if (q.arabic && q.arabic.endsWith('ْ') && q.arabic.length <= 2) {
                q.arabic = 'أَ' + q.arabic;
                // Also update the correct answer and options to reflect the new pronunciation
                // For example, if it was 's', it's now 'as'
                if (q.options) {
                  q.options = q.options.map(opt => {
                    if (opt === 's') return 'as';
                    if (opt === 'm') return 'am';
                    if (opt === 'b') return 'ab';
                    if (opt === 't') return 'at';
                    if (opt === 'sh') return 'ash';
                    if (opt === 'k') return 'ak';
                    if (opt === 'l') return 'al';
                    if (opt === 'n') return 'an';
                    if (opt.length <= 2) return 'a' + opt;
                    return opt;
                  });
                }
                if (q.correctAnswer) {
                  let ans = q.correctAnswer;
                  if (ans === 's') q.correctAnswer = 'as';
                  else if (ans === 'm') q.correctAnswer = 'am';
                  else if (ans === 'b') q.correctAnswer = 'ab';
                  else if (ans === 't') q.correctAnswer = 'at';
                  else if (ans === 'sh') q.correctAnswer = 'ash';
                  else if (ans === 'k') q.correctAnswer = 'ak';
                  else if (ans === 'l') q.correctAnswer = 'al';
                  else if (ans === 'n') q.correctAnswer = 'an';
                  else if (ans.length <= 2) q.correctAnswer = 'a' + ans;
                }
              }
            }
          }
        }
      }
    }
  }
}

fs.writeFileSync('frontend/public/questions.json', JSON.stringify(data, null, 1));
console.log('Fixed Arabic Foundation questions');
