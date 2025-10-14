import LanguageSwitcher from './LanguageSwitcher';
...
                {/* User menu dropdown */}
                {userProfile ? (
                  <Menu as="div" className="relative">
                    <div className="flex items-center space-x-2">
                      <LanguageSwitcher />
                      <Menu.Button className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        {userProfile.avatar ? (
                          <img src={userProfile.avatar} alt={userProfile.displayName} className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="hidden md:block text-left">
                          <p className="text-sm font-medium">{userProfile.displayName}</p>
                          {userProfile.isTelegramUser && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">Telegram</p>
                          )}
                        </div>
                        <ChevronDownIcon className="hidden md:block h-4 w-4" />
                      </Menu.Button>
                    </div>
                    ...
