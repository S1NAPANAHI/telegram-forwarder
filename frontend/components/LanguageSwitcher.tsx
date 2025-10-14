import { useRouter } from 'next/router';
import { Menu } from '@headlessui/react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale, locales, pathname, query, asPath } = router;

  const setLocale = async (lng: string) => {
    // Switch Next.js locale client-side
    await router.push({ pathname, query }, asPath, { locale: lng });
    // Persist choice
    localStorage.setItem('ui_language', lng);
    // Optional: call backend to persist on profile (if authenticated)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/telegram-webapp/language`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lng })
      });
      // ignore result silently
      await res.text();
    } catch {}
    // Apply RTL for Farsi
    if (lng === 'fa') {
      document.documentElement.dir = 'rtl';
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.classList.remove('rtl');
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
        {locale === 'fa' ? 'فارسی' : 'English'}
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg focus:outline-none">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button onClick={() => setLocale('fa')} className={`w-full text-left px-3 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                فارسی
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button onClick={() => setLocale('en')} className={`w-full text-left px-3 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                English
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
