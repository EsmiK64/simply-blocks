import React, { useState } from 'react';
import type { SidebarLinkItem } from '@/components/sidebar';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/sidebar';
import { cn } from '@/lib/utils';

export interface AppSidebarLayoutProps {
    children: React.ReactNode;
    logo: React.ReactNode;
    logoCollapsed: React.ReactNode;
    links: SidebarLinkItem[];
    bottomLinks?: SidebarLinkItem[];
    /** Header content shown inside the mobile top bar (e.g. breadcrumbs). */
    mobileHeader?: React.ReactNode;
    /** Header content shown above the main area on desktop (e.g. breadcrumbs). */
    desktopHeader?: React.ReactNode;
    /** Actions shown at the far right of the desktop header (e.g. theme toggle). */
    actions?: React.ReactNode;
    /** Extra content rendered above the scrollable main area (e.g. command palette). */
    topBar?: React.ReactNode;
    className?: string;
    sidebarClassName?: string;
    mainClassName?: string;
    contentClassName?: string;
    scrollable?: boolean;
}

export function AppSidebarLayout({
    children,
    logo,
    logoCollapsed,
    links,
    bottomLinks,
    mobileHeader,
    desktopHeader,
    actions,
    topBar,
    className,
    sidebarClassName,
    mainClassName,
    contentClassName,
    scrollable = true,
}: AppSidebarLayoutProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className={cn('h-screen min-h-screen w-full', className)}>
            <div className="mx-auto flex h-screen w-full flex-1 flex-col overflow-hidden rounded-md border bg-sidebar md:flex-row">
                <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody
                        className={cn(
                            'justify-between gap-10',
                            sidebarClassName,
                        )}
                        mobileHeader={mobileHeader}
                    >
                        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto p-1">
                            {open ? logo : (logoCollapsed ?? logo)}
                            <div className="mt-8 flex flex-col gap-2">
                                {links.map((link, idx) => (
                                    <SidebarLink key={idx} link={link} />
                                ))}
                            </div>
                        </div>
                        {bottomLinks && bottomLinks.length > 0 && (
                            <div className="p-1">
                                {bottomLinks.map((link, idx) => (
                                    <SidebarLink key={idx} link={link} />
                                ))}
                            </div>
                        )}
                    </SidebarBody>
                </Sidebar>

                <div className="flex h-full min-w-0 flex-1 flex-col">
                    <div className="hidden h-fit shrink-0 items-center justify-between p-4 md:flex">
                        {desktopHeader ? (
                            <div className="min-w-0 flex-1">
                                {desktopHeader}
                            </div>
                        ) : (
                            <div />
                        )}
                        {actions ? (
                            <div className="ml-4 flex items-center gap-4">
                                {actions}
                            </div>
                        ) : null}
                    </div>

                    <main
                        className={cn(
                            'z-0 flex min-h-0 w-full min-w-0 flex-1 flex-row overflow-hidden rounded-2xl bg-background p-0',
                            mainClassName,
                        )}
                    >
                        {topBar}
                        <div
                            className={cn(
                                'min-h-0 flex-1 p-8',
                                scrollable && 'overflow-auto',
                                contentClassName,
                            )}
                        >
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
