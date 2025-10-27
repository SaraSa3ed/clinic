import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLoginMutation } from '@/services/authApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import raghwaLogo from '/public/logo.png';

 

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);

  // استخدام طلب تسجيل الدخول من الخادم
  const [login, { isLoading, error, isSuccess, data }] = useLoginMutation();
  const { toast } = useToast();
  const { login: authLogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // إعادة تعيين متغير toast عند بدء تسجيل دخول جديد
    setHasShownSuccessToast(false);
    
    if (!username.trim() || !password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast({
        title: "حقول فارغة",
        description: "يرجى إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive"
      });
      return;
    }

    try {
      // إرسال طلب تسجيل الدخول إلى الخادم
      await login({ 
        email: username, // الخادم يتوقع email
        password: password 
      }).unwrap();
    } catch (err) {
      console.error('خطأ في تسجيل الدخول:', err);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      
      // عرض رسالة الخطأ المناسبة
      if (err?.data?.message) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: err.data.message,
          variant: "destructive"
        });
      } else if (err?.status === 'FETCH_ERROR') {
        toast({
          title: "خطأ في الاتصال",
          description: "خطأ في الاتصال بالخادم. تأكد من تشغيل الخادم",
          variant: "destructive"
        });
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "حدث خطأ في تسجيل الدخول",
          variant: "destructive"
        });
      }
    }
  };

  // إعادة تعيين toast عند تغيير بيانات تسجيل الدخول
  useEffect(() => {
    setHasShownSuccessToast(false);
  }, [username, password]);

  // معالجة نجاح تسجيل الدخول
  useEffect(() => {
    if (isSuccess && data && !hasShownSuccessToast) {
      console.log('🔄 Login - Login success, processing data');
      // حفظ التوكن في localStorage
      if (data.token) {
        console.log('✅ Login - Token received, calling authLogin with user data');
        console.log('📊 Login - User data from backend:', data.data?.user);
        
        // تمرير بيانات المستخدم مع التوكن
        authLogin(data.token, data.data?.user);
        
        // عرض رسالة النجاح مرة واحدة فقط
        setHasShownSuccessToast(true);
        toast({
          title: "تم تسجيل الدخول",
          description: "تم تسجيل الدخول بنجاح!",
          variant: "default"
        });
        
        // التوجه إلى لوحة التحكم
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    }
  }, [isSuccess, data, navigate, authLogin, toast, hasShownSuccessToast]);

  // Parallax effect for background
  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = (e.clientX * -1) / 100;
      const moveY = (e.clientY * -1) / 100;
      const bg = document.querySelector('.parallax-bg');
      if (bg) {
        bg.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background image with overlay */}
      <div 
        className="parallax-bg absolute inset-0 flex items-start justify-center pt-20 transform-gpu transition-transform duration-100 ease-out"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.55) 0%, rgba(2, 6, 23, 0.35) 30%, rgba(2, 6, 23, 0.55) 100%), url('/logo.png'), url('/bg.png')`,
          backgroundSize: 'cover, cover, cover',
          backgroundPosition: 'center, top, center',
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
          filter: 'saturate(2) contrast(1.1)'
        }}
      />

      {/* Soft vignette and brand tint */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-yellow-500/20 to-purple-700/40 mix-blend-multiply" />
      </div>
      
      
      
      {/* Main login container */}
      <div className={`w-full max-w-md mx-auto animate-scale-in relative z-10 ${shake ? 'animate-pulse' : ''}`}>
        {/* Login card with enhanced glassmorphism */}
        <Card className="bg-white/15 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] transform transition-all duration-300 hover:scale-[1.02] hover:bg-white/20">
          {/* Logo section */}
          <div className="text-center mb-8">
            {/* Company Logo */}
            <div className="mb-6">
              <img 
                src={raghwaLogo}
                alt="رغوة - خبراء العناية بالسيارات" 
                className="w-56 h-auto mx-auto filter drop-shadow-xl"
              />
            </div>
            
            {/* Login Header */}
            <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
              عيادة بركاء التخصصية
            </h2>
            <p className="text-sm text-white/80 mb-4">
              تسجيل الدخول
            </p>
           
          </div>

          {/* Login form with enhanced interactions */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username field with floating label effect */}
            <div className="relative group">
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-amber-500" />
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 pr-12 pl-4 bg-white/95 backdrop-blur border border-white/40 rounded-2xl text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-300 focus:bg-white transition-all duration-300 transform focus:scale-[1.01]"
              />
            </div>

            {/* Password field with enhanced security visual */}
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-amber-500" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pr-12 pl-12 bg-white/95 backdrop-blur border border-white/40 rounded-2xl text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-300 focus:bg-white transition-all duration-300 transform focus:scale-[1.01]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Enhanced login button with ripple effect */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-amber-600 via-yellow-500 to-purple-700 hover:from-amber-700 hover:via-yellow-600 hover:to-purple-800 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_12px_35px_-10px_rgba(245,158,11,0.7)] relative overflow-hidden group mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></span>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </div>
              ) : (
                <span className="relative z-10">دخول</span>
              )}
            </Button>

            {/* Enhanced forgot password link */}
            <div className="text-center mt-6">
              <button
                type="button"
                className="text-white/90 hover:text-amber-200 transition-all duration-200 text-sm font-medium hover:underline transform hover:scale-105"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          </form>
        </Card>

        {/* Enhanced footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-white/80 drop-shadow-sm">
            © جميع الحقوق محفوظة عيادة بركاء التخصصية 2025.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;