import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { ProductSchema } from '../modules/products/schemas/product.schema';
import { CarBulbSpecSchema } from '../modules/cars/schemas/car-bulb-spec.schema';
import { CouponSchema } from '../modules/coupons/schemas/coupon.schema';
import { UserSchema } from '../modules/users/schemas/user.schema';
import { CategorySchema } from '../modules/categories/schemas/category.schema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/headlight_db';

const initialCategories = [
  {
    name: 'سیستم اگزوز و مکش',
    slug: 'exhaust-intake',
    icon: 'Flame',
    description: 'انواع کیت مکش استیل، منبع اگزوز اسپرت سایلنسردار، هدرز و سر اگزوز هفت‌رنگ',
    accentColor: '#F59E0B',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'سیستم تعلیق و فنربندی',
    slug: 'suspension',
    icon: 'Disc',
    description: 'کمک فنرهای اسپرت پوسته کوتاه KDS، لول فنر لنزو و استرس‌بار تقویت تعادل شاسی',
    accentColor: '#0284C7',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'کیت بدنه و آیرودینامیک',
    slug: 'body-kits',
    icon: 'Wind',
    description: 'لیپ سپر جلو ۳ تکه، بال عقب صندوق M-Performance، دیفیوزر و فلپ آیرودینامیک',
    accentColor: '#10B981',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'روشنایی و هدلایت',
    slug: 'headlights',
    icon: 'Zap',
    description: 'هدلایت‌های پرچمدار کانپکس Conpex، لنز بای ال ای دی و پروژکتورهای خط کات استاندارد',
    accentColor: '#FBBF24',
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'تزئینات و کابین اسپرت',
    slug: 'interior-accessories',
    icon: 'Compass',
    description: 'فرمان دی‌کات چرمی OMP، سردنده کریستالی، کاور پدال آلومینیومی و رول‌بار کابین',
    accentColor: '#8B5CF6',
    isActive: true,
    sortOrder: 5,
  },
];

const initialSportProducts = [
  {
    title: 'کیت مکش هوای خنک استیل ۳۰۴ K&N با فیلتر مخروطی توربوشارژ',
    slug: 'kn-cold-air-intake-tu5',
    brand: 'K&N',
    category: 'سیستم اگزوز و مکش',
    material: 'استیل ضد زنگ تایوان گرید ۳۰۴ با ضخامت ۱.۵ میلی‌متر',
    price: 1850000,
    originalPrice: 2200000,
    stock: 28,
    isAvailable: true,
    warrantyMonths: 18,
    images: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.96,
    reviewsCount: 142,
    shortDescription: 'افزایش چشمگیر شتاب اولیه، رفع کپ پدال گاز و ایجاد صدای بم و پرطنین ورودی موتور',
    description: `کیت مکش کامل حرفه‌ای همراه لوله استیل صیقلی بدون درز با خم CNC، بست‌های تقویت شده، شلنگ‌های سیلیکونی ۴ لایه حرارتی و فیلتر شستشوپذیر نانو با مش سیمی. 
این کیت هوای خنک متراکم را از پشت جلوپنجره مستقیماً وارد دریچه گاز کرده و توان خروجی را بین ۴ الی ۷ اسب بخار ارتقاء می‌دهد.`,
    compatibility: [
      { carMake: 'ایران خودرو', carModel: 'پژو 206 (تیپ ۲ و ۵)', position: 'محفظه موتور - مانیفولد هوا' },
      { carMake: 'ایران خودرو', carModel: 'پژو 207', position: 'محفظه موتور - مانیفولد هوا' },
      { carMake: 'ایران خودرو', carModel: 'پژو پارس (پرشیا)', position: 'محفظه موتور - مانیفولد هوا' },
      { carMake: 'ایران خودرو', carModel: 'دنا و دنا پلاس', position: 'محفظه موتور - مانیفولد هوا' },
      { carMake: 'ایران خودرو', carModel: 'تارا (Tara)', position: 'محفظه موتور - مانیفولد هوا' },
      { carMake: 'سایپا', carModel: 'کوییک (Quick)', position: 'محفظه موتور - مانیفولد هوا' },
    ],
    seo: {
      metaTitle: 'خرید کیت مکش استیل K&N پژو ۲۰۶، ۲۰۷، پارس و دنا | افزایش شتاب',
      metaDescription: 'کیت مکش هوای خنک استیل ۳۰۴ اصل همراه فیلتر قابل شستشو برای موتورهای TU5 و EF7 با ارسال فوری و گارانتی ۱۸ ماهه.',
      keywords: ['کیت مکش پژو', 'کیت مکش استیل K&N', 'تیونینگ موتور ۲۰۶', 'لوازم اسپرت ماشین'],
    },
    soundClips: [
      {
        title: 'غرش مکش هوای متراکم در تخته گاز و شتاب اولیه',
        mode: 'غرش مکش هوا',
        carModel: 'پژو ۲۰۶ تیپ ۵ (موتور TU5)',
        durationSeconds: 16,
        engineRpm: 5800,
        soundType: 'intake',
        audioUrl: '/audio/kn-intake-acceleration.wav',
      },
      {
        title: 'صدای وکیوم هوای ورودی هنگام گاز خلاص و کات‌آف',
        mode: 'گاز خلاص و کات‌آف',
        carModel: 'پژو ۲۰۷ MC',
        durationSeconds: 12,
        engineRpm: 6400,
        soundType: 'intake',
        audioUrl: '/audio/kn-intake-rev.wav',
      },
    ],
    videoDemoUrl: 'https://www.aparat.com/v/kn-intake-dyno-test',
    salesCount: 420,
    isFeatured: true,
  },
  {
    title: 'منبع اگزوز اسپرت سایلنسردار HKS تمام استیل هفت‌رنگ مدل Hi-Power',
    slug: 'hks-hi-power-exhaust-muffler',
    brand: 'HKS',
    category: 'سیستم اگزوز و مکش',
    material: 'استیلنس استیل ۳۰۴ با آبکاری تیتانیوم هفت‌رنگ مقاوم به حرارت',
    price: 2650000,
    originalPrice: 3100000,
    stock: 20,
    isAvailable: true,
    warrantyMonths: 24,
    images: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.92,
    reviewsCount: 188,
    shortDescription: 'صدای بَم، دورگیری خش‌دار و ریسینگ با قابلیت نصب سایلنسر برای رانندگی آرام شهری',
    description: `منبع اگزوز HKS Hi-Power تیتانیومی یکی از اسطوره‌ای‌ترین منابع اسپرت جهان است. مجهز به سایلنسر پیچ‌شو که در عرض ۳۰ ثانیه صدای اگزوز را از غرش مسابقه‌ای به صدای فابریک کم‌صدا شهری تغییر می‌دهد. خروجی ۳ اینچی اریب با لیپ هفت‌رنگ براق جلوه‌ای فوق‌العاده به عقب خودرو می‌بخشد.`,
    compatibility: [
      { carMake: 'ایران خودرو', carModel: 'پژو 206 (تیپ ۲ و ۵)', position: 'اگزوز عقب' },
      { carMake: 'ایران خودرو', carModel: 'پژو 207', position: 'اگزوز عقب' },
      { carMake: 'ایران خودرو', carModel: 'پژو پارس (پرشیا)', position: 'اگزوز عقب' },
      { carMake: 'سایپا', carModel: 'پراید ۱۳۱ / صبا', position: 'اگزوز عقب' },
      { carMake: 'سایپا', carModel: 'شاهین (Shahin)', position: 'اگزوز عقب' },
    ],
    seo: {
      metaTitle: 'خرید منبع اگزوز اسپرت HKS سایلنسردار تیتانیومی اصل',
      metaDescription: 'بهترین قیمت منبع اگزوز هفت‌رنگ HKS با سایلنسر پیچی جهت تنظیم صدای بم و اسپرت برای تمام خودروهای داخلی و وارداتی.',
      keywords: ['منبع اگزوز اسپرت', 'منبع HKS سایلنسردار', 'صدای اگزوز ریس', 'لوازم تیونینگ اگزوز'],
    },
    soundClips: [
      {
        title: 'حالت سایلنسر باز (غرش ریسینگ و دور موتور بالا)',
        mode: 'سایلنسر باز',
        carModel: 'پژو ۲۰۶ تیپ ۵ (موتور TU5)',
        durationSeconds: 18,
        engineRpm: 6800,
        soundType: 'exhaust',
        audioUrl: '/audio/hks-open-silencer.wav',
      },
      {
        title: 'حالت سایلنسر بسته (صدای شهری نرم و فابریک)',
        mode: 'سایلنسر بسته',
        carModel: 'پژو ۲۰۶ تیپ ۵ (موتور TU5)',
        durationSeconds: 15,
        engineRpm: 3000,
        soundType: 'exhaust',
        audioUrl: '/audio/hks-closed-silencer.wav',
      },
      {
        title: 'شتاب‌گیری تخته‌گاز و کات‌آف رگباری (Backfire & Pops)',
        mode: 'کات‌آف و بک‌فایر',
        carModel: 'پژو پارس موتور زانتیا (XUM)',
        durationSeconds: 20,
        engineRpm: 7200,
        soundType: 'exhaust',
        audioUrl: '/audio/hks-pop-bang.wav',
      },
    ],
    videoDemoUrl: 'https://www.aparat.com/v/hks-hi-power-exhaust-sound-test',
    salesCount: 310,
    isFeatured: true,
  },
  {
    title: 'ست کمک فنر اسپرت گازی روغنی KDS با لول فنر لنزو (ارتفاع ۲ انگشت)',
    slug: 'kds-sport-suspension-peugeot',
    brand: 'KDS',
    category: 'سیستم تعلیق و فنربندی',
    material: 'آلیاژ فولاد کروم وانادیوم با روغن هیدرولیک آلمانی ضد کف',
    price: 3450000,
    originalPrice: 3900000,
    stock: 15,
    isAvailable: true,
    warrantyMonths: 12,
    images: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.89,
    reviewsCount: 95,
    shortDescription: 'تنظیم ارتفاع استاتیک استاندارد، چسبندگی فوق‌العاده در پیچ‌ها بدون کمترین کوبش و خشکی',
    description: `ست ۴ عددی کمک فنر پوسته کوتاه KDS به همراه لول فنرهای اسپرت لنزو سایز ۳۰ و ۳۲. طراحی دو جداره گاز-روغن باعث جذب کامل ضربات دست‌اندازهای شهری شده و تعادل هندلینگ خودرو را در سرعت‌های بالا و مانورهای ناگهانی تضمین می‌نماید.`,
    compatibility: [
      { carMake: 'ایران خودرو', carModel: 'پژو 206 (تیپ ۲ و ۵)', position: 'تعلیق جلو و عقب' },
      { carMake: 'ایران خودرو', carModel: 'پژو 207', position: 'تعلیق جلو و عقب' },
      { carMake: 'ایران خودرو', carModel: 'پژو پارس (پرشیا)', position: 'تعلیق جلو و عقب' },
      { carMake: 'ایران خودرو', carModel: 'دنا و دنا پلاس', position: 'تعلیق جلو و عقب' },
    ],
    seo: {
      metaTitle: 'خرید کمک فنر اسپرت پوسته کوتاه KDS پژو ۲۰۶ و ۲۰۷ | ارتفاع نرم',
      metaDescription: 'بهترین ست کمک فنر اسپرت KDS برای کاهش اصولی ارتفاع بدون کوبش به همراه گارانتی تعویض طلایی ۱۲ ماهه.',
      keywords: ['کمک اسپرت KDS', 'کاهش ارتفاع پژو', 'فنرلول لنزو', 'استاتیک خودرو'],
    },
    salesCount: 185,
    isFeatured: true,
  },
  {
    title: 'لیپ و دیفیوزر سپر جلو ۳ تیکه آیرودینامیک طرح فیبر کربن براق',
    slug: 'carbon-front-bumper-lip-splitter',
    brand: 'Sparco Sport',
    category: 'کیت بدنه و آیرودینامیک',
    material: 'پلیمر فشرده ABS نشکن با روکش هیدروگرافی کربن براق ۳D',
    price: 1150000,
    originalPrice: 1390000,
    stock: 40,
    isAvailable: true,
    warrantyMonths: 12,
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.84,
    reviewsCount: 78,
    shortDescription: 'جلوه تهاجمی ریسینگ، محافظ لبه زیرین سپر و افزایش نیروی رو به پایین (Downforce)',
    description: `اسپلیتر و لیپ سپر ۳ تکه قابل تنظیم عرضی، مناسب نصب روی تمام خودروهای داخلی و وارداتی. جنس نشکن در برخورد با سرعت‌گیر و سنگ‌ریزه‌های جاده با ظاهری بسیار شیک و هماهنگ با خطوط اسپرت خودرو.`,
    compatibility: [
      { carMake: 'ایران خودرو', carModel: 'پژو 206 (تیپ ۲ و ۵)', position: 'سپر جلو' },
      { carMake: 'ایران خودرو', carModel: 'پژو 207', position: 'سپر جلو' },
      { carMake: 'ایران خودرو', carModel: 'دنا و دنا پلاس', position: 'سپر جلو' },
      { carMake: 'سایپا', carModel: 'کوییک (Quick)', position: 'سپر جلو' },
      { carMake: 'سایپا', carModel: 'شاهین (Shahin)', position: 'سپر جلو' },
    ],
    seo: {
      metaTitle: 'خرید لیپ سپر جلو ۳ تیکه کربن اسپرت پژو و کوییک',
      metaDescription: 'خرید اینترنتی لیپ زیر سپر جلو طرح کربن انعطاف‌پذیر مناسب تمام خودروها با پیچ‌های مخفی و مقاومت بالا.',
      keywords: ['لیپ سپر جلو', 'دیفیوزر جلو کربن', 'لوازم بدنه اسپرت', 'کیت بدنه خودرو'],
    },
    salesCount: 290,
    isFeatured: true,
  },
  {
    title: 'هدلایت کانپکس Conpex M8 Pro پایه H7 توربو ۳ لول مس ۳۲,۰۰۰ لومن',
    slug: 'conpex-m8-pro-h7',
    brand: 'Conpex',
    category: 'روشنایی و هدلایت',
    socketType: 'H7',
    material: 'آلومینیوم هوانوردی ۶۰۶۳ همراه سه لوله مسی خلاء',
    price: 2450000,
    originalPrice: 2890000,
    stock: 45,
    isAvailable: true,
    wattage: 140,
    lumens: 32000,
    colorTemperature: 6000,
    chipType: 'Custom CSP Pro 4575 Chipset',
    coolingType: 'سه لوله خلاء مسی ضخیم + توربو فن بلبرینگی ۱۲۰۰۰ دور ژاپنی',
    hasCanbus: true,
    warrantyMonths: 18,
    images: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.95,
    reviewsCount: 168,
    shortDescription: 'پرچمدار روشنایی اسپرت با خط کات بی‌نظیر، پرتاب نور ۴۵۰ متری و بدون خطا در BSI',
    description: `هدلایت کانپکس M8 Pro با توان اسمی ۱۴۰ وات و لومن حقیقی ۳۲۰۰۰، دید در شب را مانند روز روشن کرده و خط افق کاملاً استاندارد بدون آزار راننده روبرو ارائه می‌دهد.`,
    compatibility: [
      { carMake: 'ایران خودرو', carModel: 'پژو 206 (تیپ ۲ و ۵)', position: 'نور پایین H7' },
      { carMake: 'ایران خودرو', carModel: 'پژو 207', position: 'نور پایین H7' },
      { carMake: 'ایران خودرو', carModel: 'دنا و دنا پلاس', position: 'نور پایین H7' },
      { carMake: 'ایران خودرو', carModel: 'تارا (Tara)', position: 'نور پایین H7' },
      { carMake: 'سایپا', carModel: 'کوییک (Quick)', position: 'نور پایین H7' },
    ],
    seo: {
      metaTitle: 'خرید هدلایت کانپکس Conpex M8 Pro پایه H7 | گارانتی ۱۸ ماهه طلایی',
      metaDescription: 'بهترین قیمت خرید هدلایت کانپکس M8 Pro پایه H7 با توان ۱۴۰ وات و چیپست CSP Pro، بدون ارور کنباس با ارسال فوری.',
      keywords: ['هدلایت کانپکس', 'هدلایت M8 Pro', 'هدلایت H7 پژو 206', 'روشنایی اسپرت خودرو'],
    },
    videoDemoUrl: 'https://www.aparat.com/v/conpex-m8-night-light-cutoff-test',
    salesCount: 342,
    isFeatured: true,
  },
  {
    title: 'فرمان دی‌کات اسپرت مسابقه‌ای OMP چرم سوراخ‌دار با نوار زرد بالایی',
    slug: 'omp-d-cut-racing-steering-wheel',
    brand: 'OMP',
    category: 'تزئینات و کابین اسپرت',
    material: 'اسکلت آلومینیوم دایکست فورج شده با روکش چرم طبیعی ضد لغزش دست',
    price: 1980000,
    originalPrice: 2350000,
    stock: 22,
    isAvailable: true,
    warrantyMonths: 12,
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.91,
    reviewsCount: 84,
    shortDescription: 'خوش‌دست‌ترین غربیلک فرمان اسپرت با مرکز صفر نوار زرد ریسینگ و قطر استاندارد ۳۲۰ میلی‌متر',
    description: `فرمان اسپرت دی‌کات OMP با طراحی ارگونومیک محل قرارگیری انگشتان و شست، تسلط راننده را در پیچ‌ها به بالاترین سطح ممکن می‌رساند. مناسب نصب با انواع توپی استاندارد پژو، پراید، رنو و خودروهای پیست.`,
    compatibility: [
      { carMake: 'ایران خودرو', carModel: 'پژو 206 (تیپ ۲ و ۵)', position: 'کابین - ستون فرمان' },
      { carMake: 'ایران خودرو', carModel: 'پژو پارس (پرشیا)', position: 'کابین - ستون فرمان' },
      { carMake: 'سایپا', carModel: 'پراید ۱۳۱ / صبا', position: 'کابین - ستون فرمان' },
    ],
    seo: {
      metaTitle: 'خرید فرمان دی‌کات اسپرت OMP اصل چرمی مسابقه‌ای',
      metaDescription: 'خرید فرمان اسپرت OMP دی‌کات برای ۲۰۶، پراید و پارس با دوخت زرد و قرمز و تسلط فوق‌العاده در رانندگی.',
      keywords: ['فرمان اسپرت OMP', 'فرمان دی‌کات ۲۰۶', 'لوازم اسپرت کابین', 'تیونینگ داخلی ماشین'],
    },
    salesCount: 160,
    isFeatured: true,
  },
  {
    title: 'بال عقب صندوق اسپرت طرح فیبر کربن M-Performance با پایه‌های آلومینیومی',
    slug: 'm-performance-carbon-rear-spoiler',
    brand: 'M-Performance Style',
    category: 'کیت بدنه و آیرودینامیک',
    material: 'کامپوزیت کربن فشرده تقویت‌شده با پایه‌های استند آلیاژ مشکی مات',
    price: 2100000,
    originalPrice: 2500000,
    stock: 19,
    isAvailable: true,
    warrantyMonths: 18,
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.88,
    reviewsCount: 65,
    shortDescription: 'افزایش استایل جذاب نمای عقب خودرو و پایداری آیرودینامیک محور عقب در سرعت‌های بالا',
    description: `اسپویلر عقب لبه صندوق طرح M3/M4 کربنی قابل تنظیم زاویه حمله (Attack Angle). نصب آسان و بدون لرزش با چسب‌های فوق قوی 3M صنعتی و پیچ‌های اتصال استاندارد.`,
    compatibility: [
      { carMake: 'ایران خودرو', carModel: 'پژو پارس (پرشیا)', position: 'لبه درب صندوق عقب' },
      { carMake: 'ایران خودرو', carModel: 'دنا و دنا پلاس', position: 'لبه درب صندوق عقب' },
      { carMake: 'ایران خودرو', carModel: 'تارا (Tara)', position: 'لبه درب صندوق عقب' },
      { carMake: 'سایپا', carModel: 'شاهین (Shahin)', position: 'لبه درب صندوق عقب' },
    ],
    seo: {
      metaTitle: 'خرید بال و اسپویلر عقب فیبر کربن دنا، پارس، تارا و شاهین',
      metaDescription: 'بال صندوق عقب اسپرت M-Performance با آبکاری کربن مقاوم در برابر آفتاب و شستشوی کارواش با ارسال سریع.',
      keywords: ['بال عقب دنا پلاس', 'اسپویلر صندوق پارس', 'بال عقب شاهین', 'اسپرت بدنه ماشین'],
    },
    salesCount: 140,
    isFeatured: true,
  },
  {
    title: 'استرس بار آلومینیومی فورج تقویت تعادل سر شاسی جلو HP Design',
    slug: 'hp-design-strut-bar-tu5',
    brand: 'HP Design',
    category: 'سیستم تعلیق و فنربندی',
    material: 'آلومینیوم اکسترود شده T6061 فوق سبک و مقاوم با پایه‌های برش لیزری',
    price: 1350000,
    originalPrice: 1590000,
    stock: 32,
    isAvailable: true,
    warrantyMonths: 24,
    images: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 4.97,
    reviewsCount: 110,
    shortDescription: 'مهار کردن پیچش اتاق سر پیچ‌های تند، افزایش عمر جلوبندی و تثبیت پایداری فرمان',
    description: `استرس بار (Strut Tower Brace) با متصل کردن دو سر کمک‌فنر جلو به یکدیگر، مانع از کج شدن و تغییر زوایای چرخ‌ها در مانورهای سریع و شتاب جانبی می‌شود. نصب مستقیم روی پیچ‌های سر کمک بدون نیاز به جوشکاری یا سوراخ‌کاری.`,
    compatibility: [
      { carMake: 'ایران خودرو', carModel: 'پژو 206 (تیپ ۲ و ۵)', position: 'سرکمک‌های موتور جلو' },
      { carMake: 'ایران خودرو', carModel: 'پژو 207', position: 'سرکمک‌های موتور جلو' },
      { carMake: 'ایران خودرو', carModel: 'پژو پارس (پرشیا)', position: 'سرکمک‌های موتور جلو' },
    ],
    seo: {
      metaTitle: 'خرید استرس بار اصل HP Design پژو ۲۰۶ و ۲۰۷ | تعادل پیچ‌ها',
      metaDescription: 'بهترین قیمت استرس بار آلومینیومی سبک HP Design برای تقویت سرشاسی و جلوبندی با گارانتی تعویض ۲۴ ماهه.',
      keywords: ['استرس بار ۲۰۶', 'تقویت شاسی ماشین', 'استرس بار پژو', 'تیونینگ هندلینگ'],
    },
    salesCount: 220,
    isFeatured: true,
  },
];

const initialCarSpecs = [
  {
    carMake: 'ایران خودرو',
    carModel: 'پژو 206 (تیپ ۲ و ۵)',
    lowBeam: 'H7',
    highBeam: 'H1',
    fogLight: 'H1',
    notes: 'پرفروش‌ترین اتاق تیونینگ؛ سازگار با انواع کیت مکش TU5، اگزوز HKS، کمک فنر KDS و لیپ سپر',
  },
  {
    carMake: 'ایران خودرو',
    carModel: 'پژو 207',
    lowBeam: 'H7',
    highBeam: 'H1',
    fogLight: 'H11',
    notes: 'دارای لنز فابریک؛ مناسب ست کیت بدنه کربن، اسپویلر و هدرز استیل',
  },
  {
    carMake: 'ایران خودرو',
    carModel: 'پژو پارس (پرشیا)',
    lowBeam: 'H7',
    highBeam: 'H7',
    fogLight: 'H3',
    notes: 'سازگار با بال عقب M3، کمک لول فنر استاتیک و منبع اگزوز دولول',
  },
  {
    carMake: 'ایران خودرو',
    carModel: 'دنا و دنا پلاس',
    lowBeam: 'H7',
    highBeam: 'H1',
    fogLight: 'H1',
    notes: 'کیت مکش توربو EF7، دیسک‌های ترمز خنک‌شونده سوراخ‌دار و اسپویلر لبه صندوق',
  },
  {
    carMake: 'ایران خودرو',
    carModel: 'تارا (Tara)',
    lowBeam: 'H7',
    highBeam: 'H1',
    fogLight: 'H16',
    notes: 'سیستم برق مالتی‌پلکس پیشرفته، نیازمند تجهیزات با تاییدیه Canbus',
  },
  {
    carMake: 'سایپا',
    carModel: 'کوییک (Quick)',
    lowBeam: 'H7',
    highBeam: 'H1',
    fogLight: 'H1',
    notes: 'کیت مکش فیلتردار، لیپ ۳ تکه زیر سپر و منبع اگزوز صدای بم شهری',
  },
  {
    carMake: 'سایپا',
    carModel: 'شاهین (Shahin)',
    lowBeam: 'H7',
    highBeam: 'H1',
    fogLight: 'H11',
    notes: 'تیونینگ توربو، بال عقب، خط کات زنونی و لوازم داخل کابین چرمی',
  },
  {
    carMake: 'سایپا',
    carModel: 'پراید ۱۳۱ / صبا',
    lowBeam: 'H4',
    highBeam: 'H4',
    fogLight: 'H3',
    notes: 'منبع اسپرت سایلنسردار، غربیلک فرمان اسپرت OMP و کاهش ارتفاع استاتیک',
  },
];

const initialCoupons = [
  {
    code: 'SPORT20',
    discountType: 'PERCENTAGE',
    value: 20,
    minOrderAmount: 1500000,
    maxDiscountAmount: 400000,
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'TUNING100',
    discountType: 'FIXED_AMOUNT',
    value: 100000,
    minOrderAmount: 800000,
    usageLimit: 500,
    usedCount: 0,
    isActive: true,
  },
];

async function seedDatabase() {
  console.log(`🔌 Connecting to MongoDB at ${MONGODB_URI}...`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    // 1. Sport Products
    const ProductModel = mongoose.model('Product', ProductSchema);
    try {
      await ProductModel.collection.dropIndexes();
      console.log('🔄 Dropped legacy product indexes.');
    } catch (e) {
      // Collection may be empty or newly created
    }
    await ProductModel.deleteMany({});
    const createdProds = await ProductModel.insertMany(initialSportProducts);
    console.log(`✨ Seeded ${createdProds.length} premium car sport & tuning products!`);
    await ProductModel.ensureIndexes();

    // 2. Car Specs
    const CarSpecModel = mongoose.model('CarBulbSpec', CarBulbSpecSchema);
    await CarSpecModel.deleteMany({});
    const createdCars = await CarSpecModel.insertMany(initialCarSpecs);
    console.log(`✨ Seeded ${createdCars.length} car specifications & fitments!`);
    await CarSpecModel.ensureIndexes();

    // 3. Categories
    const CategoryModel = mongoose.model('Category', CategorySchema);
    try {
      await CategoryModel.collection.dropIndexes();
    } catch (e) {}
    await CategoryModel.deleteMany({});
    const createdCats = await CategoryModel.insertMany(initialCategories);
    console.log(`✨ Seeded ${createdCats.length} dynamic sport categories!`);
    await CategoryModel.ensureIndexes();

    // 4. Coupons
    const CouponModel = mongoose.model('Coupon', CouponSchema);
    await CouponModel.deleteMany({});
    const createdCoupons = await CouponModel.insertMany(initialCoupons);
    console.log(`✨ Seeded ${createdCoupons.length} discount coupons!`);
    await CouponModel.ensureIndexes();

    // 5. Admin User
    const UserModel = mongoose.model('User', UserSchema);
    await UserModel.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('peyman1378', salt);
    await UserModel.create({
      fullName: 'علی تقی تاش',
      phoneNumber: '09124702517',
      email: 'ali.taghitash@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    });
    console.log('✨ Seeded Admin user: علی تقی تاش (09124702517)!');

    console.log('🏁 Sport store database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seedDatabase();
