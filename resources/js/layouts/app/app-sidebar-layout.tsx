import { Link } from '@inertiajs/react';
import { FlaskConical, FolderGit2 } from 'lucide-react';
import React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { AppSidebarLayout as SidebarLayout } from '@/layouts/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

const links = [
    {
        label: 'Block Lab',
        href: '/test-block-lab',
        icon: (
            <FlaskConical className="h-5 w-5 shrink-0 text-card-foreground" />
        ),
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
    <Link href="/" className="flex items-center gap-2 overflow-hidden py-1">
        <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
        </div>
        <span className="overflow-hidden text-sm font-semibold whitespace-nowrap text-card-foreground">
            Simply Blocks
        </span>
    </Link>
);

const LogoCollapsed = () => (
    <Link href="/" className="flex items-center justify-center py-1">
        <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
        </div>
    </Link>
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
            desktopHeader={
                breadcrumbs && breadcrumbs.length > 0 ? (
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                ) : undefined
            }
            scrollable={true}
            contentClassName="p-0"
        >
            {children}
        </SidebarLayout>
    );
}
