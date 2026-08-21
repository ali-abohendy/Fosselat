import json
import re

with open('frontend/public/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

letter_map = {
    "أ": "Hamzah", "ب": "Baa", "ت": "Taa", "ث": "Thaa", "ج": "Jeem", "ح": "Haa", "خ": "Khaa", "د": "Daal", "ذ": "Dhaal",
    "ر": "Raa", "ز": "Zay", "س": "Seen", "ش": "Sheen", "ص": "Saad", "ض": "Daad", "ط": "Taa", "ظ": "Zhaa", "ع": "Ayn",
    "غ": "Ghayn", "ف": "Faa", "ق": "Qaaf", "ك": "Kaaf", "ل": "Laam", "م": "Meem", "ن": "Noon", "ه": "Haa", "هـ": "Haa",
    "و": "Waw", "ي": "Yaa", "ة": "Taa Marbutah"
}

def translate_options(q):
    new_opts = []
    for opt in q.get('options', []):
        opt_s = opt.strip()
        if opt_s in letter_map:
            new_opts.append(letter_map[opt_s])
        else:
            new_opts.append(opt)
    q['options'] = new_opts
    ca = str(q.get('correctAnswer', '')).strip()
    if ca in letter_map:
        q['correctAnswer'] = letter_map[ca]

for t in data['tracks']:
    for p in t['programs']:
        for bank in p.get('levelBanks', []):
            new_questions = []
            seen_keys = set()
            
            for q in bank.get('questions', []):
                prompt = q.get('prompt', '')
                arabic = q.get('arabic', '')
                options = q.get('options', [])
                
                # Rule 1 & 13: Letters at beginning or end
                if "Which letter" in prompt or "adds at the end" in prompt:
                    translate_options(q)
                
                # Rule 2: Amal question
                if "How is this word read" in prompt or "How is this read" in prompt:
                    if any("'" in o or "’" in o or "A-M-A-L" in o for o in options):
                        q['options'] = [o if o not in ["A-M-A-L'", "A-M-A-L’", "A-M-A'L", "A'M'A'L"] else "A-M-I-L" for o in options]
                        
                # Rule 3 & 10A: Duplicates
                # We identify duplicates by their prompt and arabic content.
                dup_key = prompt.strip() + "|" + arabic.strip()
                if "sign لا" in prompt or "sign ميم" in prompt or "يعرف المجرمون بسيماهم" in arabic:
                    if dup_key in seen_keys:
                        continue # Skip this question, it's a duplicate
                    seen_keys.add(dup_key)
                
                # Rule 4: Madd Munfasil - Hafs
                if 'Madd Munfasil' in prompt and 'Hafs' in prompt:
                    q['options'] = [o if not ('4 or 5' in o) else '2, 4, or 5 counts' for o in options]
                    if '4 or 5' in str(q['correctAnswer']):
                        q['correctAnswer'] = '2, 4, or 5 counts'
                
                # Rule 5: Deepest part of the throat
                if 'deepest part of the throat' in prompt:
                    if 'ه' in options and 'أ' in options:
                        q['options'] = [o if o != 'ه' else 'خ' for o in options]
                    elif 'هـ' in options and 'أ' in options:
                        q['options'] = [o if o != 'هـ' else 'خ' for o in options]
                    if q['correctAnswer'] in ['ه', 'هـ']:
                        q['correctAnswer'] = 'أ'
                
                # Rules 6-12: Context truncation in Memorization
                if 'آمنوا وعملوا الصالحات' in arabic and 'إلا الذين' not in arabic:
                    q['arabic'] = 'إلا الذين ' + arabic
                if 'على الأرائك' in arabic and 'متكئين فيها' not in arabic:
                    q['arabic'] = 'متكئين فيها ' + arabic
                if 'لا يرون فيها شمسا' in arabic and 'زمهريرا' not in arabic:
                    q['arabic'] = arabic + ' ولا زمهريرا'
                if 'ضل سعيهم' in arabic and 'في الحياة الدنيا' not in arabic:
                    q['arabic'] = arabic.replace('ضل سعيهم', 'ضل سعيهم في الحياة الدنيا وهم يحسبون أنهم يحسنون صنعا')
                if 'إلا خسارة' in arabic and 'واتبعوا' not in arabic:
                    q['arabic'] = 'واتبعوا ' + arabic
                if 'وهي رميم' in arabic and 'وضرب لنا' not in arabic:
                    q['arabic'] = 'وضرب لنا مثلا ونسي ' + arabic
                if 'قد أحسن الله' in arabic and 'رزقا' not in arabic:
                    q['arabic'] = arabic + ' رزقا'
                if 'عنه سيئاته' in arabic and 'ومن يؤمن بالله' not in arabic:
                    q['arabic'] = 'ومن يؤمن بالله ويعمل صالحا يكفر ' + arabic.replace('يكفر ', '').replace('ويعمل صالحا ', '')
                if 'ويدخله جنات' in arabic and 'الأنهار' not in arabic:
                    q['arabic'] = arabic + ' تجري من تحتها الأنهار'
                if 'من ورائه جهنم' in arabic and 'صديد' not in arabic:
                    q['arabic'] = arabic + ' صديد'
                if 'ما يتقون إن الله' in arabic and 'وما كان الله' not in arabic:
                    q['arabic'] = 'وما كان الله ليضل قوما بعد إذ هداهم حتى يبين لهم ' + arabic.replace('حتى يبين لهم ', '')
                
                # Rule 14: Arabic Foundation Level 2 - "How is this read?" with "سْ"
                if q.get('arabic', '').strip() == 'سْ':
                    q['arabic'] = 'أَسْ'
                    q['options'] = ['as', 'is', 'us', 'sa']
                    q['correctAnswer'] = 'as'

                new_questions.append(q)
            bank['questions'] = new_questions

with open('frontend/public/questions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
print("Done processing questions.json")
