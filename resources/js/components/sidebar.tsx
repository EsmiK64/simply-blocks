import { Link } from '@inertiajs/react';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState, createContext, useContext } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface SidebarLinkItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export interface SidebarContextProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
    undefined,
);

export const useSidebar = () => {
    const context = useContext(SidebarContext);

    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }

    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = ({
    mobileHeader,
    ...props
}: React.ComponentProps<typeof motion.div> & {
    mobileHeader?: React.ReactNode;
}) => {
    const mobile = useIsMobile();

    return mobile ? (
        <MobileSidebar
            header={mobileHeader}
            {...(props as React.ComponentProps<'div'>)}
        />
    ) : (
        <DesktopSidebar {...props} />
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof motion.div>) => {
    const { open, setOpen, animate } = useSidebar();

    return (
        <motion.div
            className={cn(
                'hidden h-full shrink-0 overflow-hidden px-3 py-4 md:flex md:flex-col',
                className,
            )}
            animate={{
                width: animate ? (open ? '250px' : '68px') : '250px',
            }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MobileSidebar = ({
    className,
    children,
    header,
    ...props
}: React.ComponentProps<'div'> & { header?: React.ReactNode }) => {
    const { open, setOpen } = useSidebar();

    return (
        <div
            className={cn(
                'flex w-full flex-row items-center justify-between px-8 py-4 md:hidden',
            )}
            {...props}
        >
            <div className="z-20 flex w-full items-center justify-between">
                {header ? <div className="flex-1">{header}</div> : null}
                <div className="ml-auto flex items-center gap-4">
                    <button
                        type="button"
                        aria-label="Open navigation menu"
                        className="rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => setOpen(!open)}
                    >
                        <IconMenu2 className="size-6" />
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: 'easeInOut',
                        }}
                        className={cn(
                            'fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-sidebar p-10',
                            className,
                        )}
                    >
                        <button
                            type="button"
                            aria-label="Close navigation menu"
                            className="absolute top-10 right-10 z-50 rounded-md p-1 text-sidebar-foreground hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => setOpen(!open)}
                        >
                            <IconX className="size-6" />
                        </button>
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SidebarLink = ({
    link,
    className,
    ...props
}: {
    link: SidebarLinkItem;
    className?: string;
} & Omit<React.ComponentProps<'a'>, 'href'>) => {
    const { open, animate } = useSidebar();
    const isInternal = link.href.startsWith('/') && !link.href.startsWith('//');

    const content = (
        <>
            <div className="flex w-8 shrink-0 items-center justify-center">
                {link.icon}
            </div>
            <motion.span
                animate={{
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="!m-0 overflow-hidden !p-0 text-sm whitespace-nowrap text-card-foreground transition-transform duration-150 group-hover/sidebar:translate-x-1"
                style={{ display: 'inline-block', minWidth: 0 }}
            >
                {link.label}
            </motion.span>
        </>
    );

    const commonClasses = cn(
        'group/sidebar flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden rounded-md py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
    );

    if (isInternal) {
        return (
            <Link href={link.href} className={commonClasses}>
                {content}
            </Link>
        );
    }

    return (
        <a
            href={link.href}
            className={commonClasses}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        >
            {content}
        </a>
    );
};
