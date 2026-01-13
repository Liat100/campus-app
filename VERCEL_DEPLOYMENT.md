# מדריך פריסה ל-Vercel

## 🔴 השגיאה שקיבלת: `DEPLOYMENT_NOT_FOUND`

שגיאה זו אומרת שהפרויקט **עדיין לא פרוס** ב-Vercel, או שאת מנסה לגשת לדומיין שלא קיים.

---

## ✅ איך לפרוס את הפרויקט ל-Vercel

יש **שתי דרכים** לפרוס:

### דרך 1: דרך Vercel Dashboard (הקלה ביותר) ⭐

1. **היכנסי ל-Vercel:**
   - פתחי: https://vercel.com
   - התחברי עם GitHub/Email

2. **יצירת פרויקט חדש:**
   - לחצי על **"Add New..."** → **"Project"**
   - **אם הפרויקט שלך ב-GitHub:**
     - בחרי את ה-Repository
     - Vercel יזהה אוטומטית שזה Next.js
     - לחצי **"Deploy"**
   - **אם הפרויקט לא ב-GitHub:**
     - השתמשי בדרך 2 (CLI)

3. **המתני לפריסה:**
   - Vercel יבנה את הפרויקט (זה יכול לקחת 1-3 דקות)
   - בסיום, תקבלי דומיין כמו: `campus-app-xyz.vercel.app`

4. **חשוב! הוספת KV Store:**
   - אחרי הפריסה, לכי ל-Settings → Storage
   - לחצי **"Create Database"** → בחרי **"KV"**
   - תני שם (לדוגמה: `campus-kv`)
   - Vercel יתקין את המשתנים אוטומטית

---

### דרך 2: דרך Vercel CLI

1. **התקנת Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **התחברות:**
   ```bash
   vercel login
   ```

3. **פריסה:**
   ```bash
   vercel
   ```
   - תעני על השאלות (Enter ל-default)
   - בסוף תקבלי דומיין

4. **פריסה לפרודקשן:**
   ```bash
   vercel --prod
   ```

---

## 🔑 לאחר הפריסה - הגדרת KV Store

**חשוב מאוד!** בלי KV Store, האתר לא יעבוד עם מסד נתונים משותף.

1. **הוספת KV Store:**
   - Vercel Dashboard → Projects → הפרויקט שלך
   - Settings → Storage
   - Create Database → KV
   - תני שם ולחצי Create

2. **וודאי שמשתני הסביבה מוגדרים:**
   - Vercel אמור להוסיף אותם אוטומטית
   - Settings → Environment Variables
   - אמור להיות: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, וכו'

3. **Redeploy אחרי הוספת KV:**
   - Deployments → ... (3 נקודות) → Redeploy

---

## ✅ בדיקה שהכל עובד

1. **פתחי את הדומיין שקיבלת:**
   - לדוגמה: `https://campus-app-xyz.vercel.app`

2. **בדיקה פשוטה:**
   - צרי קורס חדש
   - שמרי
   - פתחי בדפדפן אחר (Incognito) או במחשב אחר
   - רענני - האם הקורס מופיע? ✅

---

## ❓ שאלות נפוצות

**Q: האם צריך Git Repository?**
- לא חובה, אבל מומלץ מאוד
- אם אין, אפשר לעשות `git init` ו-`git push` ל-GitHub
- או להשתמש ב-Vercel CLI (דרך 2)

**Q: כמה זה עולה?**
- Vercel מציעה תוכנית חינמית (Hobby)
- כולל KV Store חינמי (בגבולות מסוימים)
- מספיק לפרויקטים קטנים-בינוניים

**Q: איך משנים דומיין?**
- Settings → Domains
- אפשר להוסיף דומיין מותאם אישית

---

## 🆘 בעיות?

אם יש שגיאות בפריסה:
1. בדקי את ה-Logs ב-Vercel Dashboard → Deployments → בחרי deployment → View Function Logs
2. וודאי שהפרויקט בונה בהצלחה מקומית: `npm run build`
3. אם יש שגיאות build, תקני אותן לפני פריסה
