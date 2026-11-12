import mongoose from 'mongoose';
import { ReviewSchema } from '../modules/reviews/schemas/review.schema';
import { ProductSchema } from '../modules/products/schemas/product.schema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/headlight_db';

const sampleReviews = [
  // HKS Hi-Power Exhaust Muffler
  {
    productSlug: 'hks-hi-power-exhaust-muffler',
    customerName: 'کامران یزدانی',
    carModel: 'پژو ۲۰۶ تیپ ۵ (موتور TU5)',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 5,
    comment: 'صدای اگزوز در حالت سایلنسر باز فوق‌العاده بم و گوش‌نوازه، اصلاً حالت وزوز یا جیغ نداره. وقتی هم سایلنسر رو با پیچ آلن می‌بندم دقیقاً مثل منبع فابریک بی‌صدا میشه برای معاینه فنی و شهر.',
    advantages: ['استیل ۳۰۴ ضدزنگ اصل', 'سایلنسر کارآمد و قابل تنظیم', 'سر اگزوز هفت‌رنگ براق باکیفیت', 'بک‌فایر و پاپس بسیار جذاب'],
    disadvantages: ['نیاز به جوشکاری تمیز در نصب'],
    isVerifiedBuyer: true,
    isApproved: true,
  },
  {
    productSlug: 'hks-hi-power-exhaust-muffler',
    customerName: 'سامان افشار',
    carModel: 'پژو پارس موتور TU5',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 4,
    fanNoiseScore: 5,
    comment: 'بسته‌بندی لومیکس اسپرت درجه یک بود. بعد از نصب شتاب ثانویه توی دورهای بالای ۴۰۰۰ دور قشنگ باز شد و نفس ماشین آزادتر کار می‌کنه.',
    advantages: ['کیفیت جوش تیگ تمیز', 'عدم داغ شدن بدنه سپر', 'طنین صدای عالی'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },
  {
    productSlug: 'hks-hi-power-exhaust-muffler',
    customerName: 'امیرحسین رضوی',
    carModel: 'دنا پلاس توربو',
    rating: 4,
    cutOffLineScore: 4,
    beamThrowScore: 5,
    fanNoiseScore: 4,
    comment: 'روی دنا پلاس توربو صدای غرش توربو رو عالی به نمایش می‌ذاره. سایلنسرش خیلی به درد بخوره.',
    advantages: ['غرش زیبای توربو', 'متریال مقاوم'],
    disadvantages: ['برای نصب بست نگهدارنده اختصاصی لازمه'],
    isVerifiedBuyer: true,
    isApproved: true,
  },

  // K&N Cold Air Intake
  {
    productSlug: 'kn-cold-air-intake-tu5',
    customerName: 'مهرداد کریمی',
    carModel: 'پژو ۲۰۷ دنده‌ای',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 5,
    comment: 'صدای مکش هوا وقتی تخته گاز می‌کنی شبیه ماشین‌های سوپراسپرت میشه! واکنش پدال گاز خیلی سریع‌تر شده و تاخیر دریچه گاز برقی تقریباً برطرف شد.',
    advantages: ['صدای فوق‌العاده مکش', 'حذف تاخیر پدال گاز', 'فیلتر قابل شستشو K&N', 'لوله رابط استیل ۳۰۴ ضخیم'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },
  {
    productSlug: 'kn-cold-air-intake-tu5',
    customerName: 'پویا ناصری',
    carModel: 'پژو پارس ELX',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 4,
    fanNoiseScore: 5,
    comment: 'نصبش کمتر از ۲۰ دقیقه طول کشید و کاملاً فابریک با بست‌های داخل جعبه جا رفت. عایق حرارتی هم عالی کار می‌کنه و هوای خنک رو مستقیم می‌کشه.',
    advantages: ['نصب کاملاً فابریک بدون دستکاری', 'کاهش دمای هوای ورودی به منیفولد'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },

  // KDS Sport Suspension
  {
    productSlug: 'kds-sport-suspension-peugeot',
    customerName: 'بهنام رستمی',
    carModel: 'پژو ۲۰۶ صندوقدار',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 5,
    comment: 'نگران کوبش بودم ولی با این ست KDS روغنی-گازی کره‌ای ماشین اصلاً خشک نشد! ارتفاع روی دو انگشت ایستاد و هندلینگ تو اتوبان و سرعت‌های بالای ۱۲۰ زمین تا آسمون فرق کرد.',
    advantages: ['سواری نرم و بدون کوبش', 'کاهش دقیق ارتفاع تا ۲ انگشت', 'کیفیت ساخت کره جنوبی', 'استحکام لول فنر لنزو'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },
  {
    productSlug: 'kds-sport-suspension-peugeot',
    customerName: 'سینا احمدی',
    carModel: 'پژو ۲۰۷ اتوماتیک',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 5,
    comment: 'رخ ماشین با این ارتفاع فوق‌العاده شد. پیچ‌ها رو با اعتماد به نفس کامل می‌پیچم بدون اینکه عقب ماشین بازی کنه.',
    advantages: ['چسبندگی فوق‌العاده به آسفالت', 'رخ ریسینگ استاندارد'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },

  // Conpex M8 Pro H7 Headlight
  {
    productSlug: 'conpex-m8-pro-h7',
    customerName: 'علیرضا شمس',
    carModel: 'پژو ۲۰۷ فابریک (نور پایین H7)',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 5,
    comment: 'خط کات این هدلایت میلی‌متری تنظیم میشه و خط افقی دقیق می‌اندازه. اصلاً به چشم راننده روبرو نمی‌زنه ولی تابلوها و آسفالت رو مثل روز روشن می‌کنه.',
    advantages: ['خط کات تیز و استاندارد', 'فن بی‌صدا با دور متغیر', 'حرارت پایین به لطف لوله‌های مسی', 'عدم ارور در سیستم مالتی‌پلکس'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },
  {
    productSlug: 'conpex-m8-pro-h7',
    customerName: 'نوید صادقی',
    carModel: 'تارا اتوماتیک',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 4,
    comment: 'بدون شک قوی‌ترین هدلایتیه که تا الان تست کردم. چیپ‌های CSP Pro نور یکدست سفید ۶۰۰۰ کلوین دارند بدون هاله آبی.',
    advantages: ['نور سفید طبیعی', 'پرتاب نور فوق‌العاده در شب'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },

  // HP Design Strut Bar
  {
    productSlug: 'hp-design-strut-bar-tu5',
    customerName: 'فرزاد کاظمی',
    carModel: 'پژو ۲۰۶ تیپ ۵',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 5,
    comment: 'گیجی فرمان موقع عبور از سرعت‌گیرها و پیچ‌های تند کلاً از بین رفت. آلومینیوم فورج T6 بسیار محکمه و رنگ الکترواستاتیکش هم خیلی باکیفیته.',
    advantages: ['حذف گیجی فرمان', 'تقویت استحکام اتاق', 'نصب آسان روی پیچ‌های سرکمک'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },

  // OMP Racing Steering Wheel
  {
    productSlug: 'omp-d-cut-racing-steering-wheel',
    customerName: 'شاهین مرادی',
    carModel: 'پراید اسپرت / ریو',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 5,
    comment: 'دست‌فرمان با این غربیلک دی‌کات چرمی به شدت دقیق و لذت‌بخش شده. ضخامت دور فرمان ارگونومیک و مناسبه.',
    advantages: ['چرم سوراخ‌دار ضدتعریق', 'طراحی مسابقه‌ای D-Cut', 'دوخت زرد رنگ با کیفیت'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },

  // Carbon Front Bumper Lip Splitter
  {
    productSlug: 'carbon-front-bumper-lip-splitter',
    customerName: 'دانیال پیروزی',
    carModel: 'دنا پلاس توربو',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 5,
    comment: 'رخ جلوی ماشین رو فوق‌العاده خشن و جذاب کرده. ۳ تکه بودنش باعث میشه بتونی روی پهنای هر سپری به دقت تنظیمش کنی.',
    advantages: ['انعطاف مناسب و نشکن در برابر موانع', 'طرح فیبر کربن براق زیبا', 'پیچ و اتصالات کامل همراه بسته'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },

  // M-Performance Carbon Rear Spoiler
  {
    productSlug: 'm-performance-carbon-rear-spoiler',
    customerName: 'امید سعیدی',
    carModel: 'پژو پارس TU5',
    rating: 5,
    cutOffLineScore: 5,
    beamThrowScore: 5,
    fanNoiseScore: 5,
    comment: 'کیفیت براقیت هیدروگرافی کربن و پایه‌های آلومینیومی عالیه. در سرعت‌های بالای ۱۰۰ چسبندگی عقب خودرو محسوسه.',
    advantages: ['پایه‌های آلومینیومی مقاوم', 'پوشش UV ضدآفتاب‌سوختگی', 'طراحی آیرودینامیک شیک'],
    disadvantages: [],
    isVerifiedBuyer: true,
    isApproved: true,
  },
];

async function seedReviews() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for reviews seeding...');

  const ProductModel = mongoose.model('Product', ProductSchema);
  const ReviewModel = mongoose.model('Review', ReviewSchema);

  // Clear existing reviews
  await ReviewModel.deleteMany({});
  console.log('Cleared existing reviews.');

  const products = await ProductModel.find({});
  console.log(`Found ${products.length} products in DB.`);

  let insertedCount = 0;
  for (const item of sampleReviews) {
    const product = products.find((p) => p.slug === item.productSlug);
    if (product) {
      await ReviewModel.create({
        productId: product._id.toString(),
        customerName: item.customerName,
        carModel: item.carModel,
        rating: item.rating,
        cutOffLineScore: item.cutOffLineScore,
        beamThrowScore: item.beamThrowScore,
        fanNoiseScore: item.fanNoiseScore,
        comment: item.comment,
        advantages: item.advantages,
        disadvantages: item.disadvantages,
        isVerifiedBuyer: item.isVerifiedBuyer,
        isApproved: item.isApproved,
      });
      insertedCount++;
    }
  }

  console.log(`Successfully seeded ${insertedCount} verified reviews!`);

  // Update ratings and reviewsCount for each product
  for (const product of products) {
    const reviews = await ReviewModel.find({ productId: product._id.toString(), isApproved: true });
    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await ProductModel.findByIdAndUpdate(product._id, {
        rating: Number(avg.toFixed(2)),
        reviewsCount: reviews.length,
      });
      console.log(`Updated ${product.slug}: rating=${avg.toFixed(2)}, count=${reviews.length}`);
    }
  }

  await mongoose.disconnect();
  console.log('Reviews seed completed.');
}

seedReviews().catch((err) => {
  console.error('Seeding reviews failed:', err);
  process.exit(1);
});
