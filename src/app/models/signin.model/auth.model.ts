type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string | string[];
  permissions?: string[]; // اسم الكليم المتوقّع للصلاحيات
  perms?: string[];       // بديل لو كانت باسم آخر
  [k: string]: any;
};