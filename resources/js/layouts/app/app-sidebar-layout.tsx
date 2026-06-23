import React from 'react';
import { FlaskConical, FolderGit2 } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { AppSidebarLayout as SidebarLayout } from '@/layouts/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

const links = [
    {
        label: 'Block Lab',
        href: '/test-block-lab',
        icon: <FlaskConical className="h-5 w-5 shrink-0 text-card-foreground" />,
    },
];

const bottomLinks = [
    {
        label: 'GitHub',
        href: 'https://github.com/EsmiK64/simply-blocks',
        icon: <FolderGit2 className="h-5 w-5 shrink-0 text-card-foreground" />,
    },
];

const LogoExpanded = () => (
    <a href="/" className="flex items-center gap-2 py-1 overflow-hidden">
        <div className="flex shrink-0 aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
        </div>
        <span className="text-sm font-semibold text-card-foreground whitespace-nowrap overflow-hidden">Simply Blocks</span>
    </a>
);

const LogoCollapsed = () => (
    <a href="/" className="flex items-center justify-center py-1">
        <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
        </div>
    </a>
);

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}) {
    return (
        <SidebarLayout
            logo={<LogoExpanded />}
            logoCollapsed={<LogoCollapsed />}
            links={links}
            bottomLinks={bottomLinks}
            scrollable={true}
            contentClassName="p-0"
        >
            {children}
        </SidebarLayout>
    );
}
