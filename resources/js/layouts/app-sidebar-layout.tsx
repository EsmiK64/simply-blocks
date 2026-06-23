"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Sidebar,
    SidebarBody,
    SidebarLink,
    SidebarLinkItem,
} from "@/components/sidebar";

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
        <div className={cn("min-h-screen w-screen h-screen", className)}>
            <div className="mx-auto flex w-full flex-1 flex-col rounded-md border md:flex-row bg-sidebar h-screen overflow-hidden">
                <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody
                        className={cn(
                            "gap-10 justify-between",
                            sidebarClassName
                        )}
                        mobileHeader={mobileHeader}
                    >
                        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto p-1">
                            {logo}
                            <div className="flex flex-col gap-2 mt-8">
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

                <div className="flex flex-col h-full min-h-0">
                    <div className="hidden md:flex items-center justify-between shrink-0 h-fit p-4">
                        {desktopHeader ? (
                            <div className="flex-1 min-w-0">{desktopHeader}</div>
                        ) : (
                            <div />
                        )}
                        {actions ? (
                            <div className="flex items-center gap-4 ml-4">
                                {actions}
                            </div>
                        ) : null}
                    </div>

                    <main
                        className={cn(
                            "flex flex-1 flex-row min-h-0 rounded-2xl bg-background min-w-[95dvw] p-0 z-0 overflow-hidden",
                            mainClassName
                        )}
                    >
                        {topBar}
                        <div
                            className={cn(
                                "flex-1 min-h-0 p-8",
                                scrollable && "overflow-auto",
                                contentClassName
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
