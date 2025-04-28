'use client';

import { Calendar, Inbox, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NavUser } from '@/components/nav-user';
import { useState } from 'react';
import { setSidebarExpandedCookie } from '@/actions/sidebar';

const items = [
  {
    title: 'Passes',
    url: '/passes',
    icon: Inbox,
  },
  {
    title: 'Notifications',
    url: '/notifications',
    icon: Calendar,
  },
];

export function AppSidebar({ sidebarExpanded }: { sidebarExpanded: boolean }) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(sidebarExpanded);

  function handleExpansionToggle() {
    setIsSidebarExpanded(!isSidebarExpanded);
    setSidebarExpandedCookie(!isSidebarExpanded ? 'true' : 'false');
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 shadow-md shadow-gray-200 bg-white sm:hidden">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center">
            <Wallet className="w-6 h-6 mr-2" />
            <span className="text-lg font-bold">Wallet Pass</span>
          </div>
          <button
            data-drawer-target="default-sidebar"
            data-drawer-toggle="default-sidebar"
            aria-controls="default-sidebar"
            type="button"
            className="p-2 text-sm text-primary rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {showSidebar && (
        <aside
          id="default-sidebar"
          className={`fixed top-0 left-0 z-40 lg:relative ${sidebarExpanded ? 'w-64' : 'w-20'} h-screen transition-all duration-300 ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}
          aria-label="Sidebar"
        >
          <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 relative">
            <div className="flex items-center justify-between mb-5 px-2 py-3">
              {sidebarExpanded && <span className="text-xl font-extrabold">Wallet Pass</span>}
              <button
                className="hidden sm:block p-2 text-sm text-primary rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={handleExpansionToggle}
                aria-label="Toggle sidebar width"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d={
                      sidebarExpanded
                        ? 'M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z'
                        : 'M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z'
                    }
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <ul className="space-y-2 font-medium">
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <li key={item.title}>
                    <Link
                      href={item.url}
                      className={cn(
                        'flex items-center justify-center gap-2 p-2 text-gray-900 rounded-lg hover:bg-gray-100 group',
                        isActive && 'bg-primary/10'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'w-5 h-5 text-gray-500 transition duration-75 group-hover:text-primary',
                          isActive && 'text-primary'
                        )}
                      />
                      {sidebarExpanded && (
                        <span className={cn('flex-1', isActive && 'font-semibold text-primary')}>
                          {item.title}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <NavUser />
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
