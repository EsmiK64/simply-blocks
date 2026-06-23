import React from 'react';
import { BlockDefinition, BlockInstance } from './types';
import { getBlockDefinition } from './definitions';

const KEY_OPTIONS = [
    'space', 'up arrow', 'down arrow', 'left arrow', 'right arrow',
    'any', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
].map(k => ({ label: k, value: k }));

interface BlockRendererProps {
    block: BlockInstance;
    isDragging?: boolean;
    onFieldChange?: (fieldName: string, value: string | number | boolean) => void;
    onInputRemove?: (blockId: string, slotName: string) => void;
}

export default function BlockRenderer({ block, isDragging = false, onFieldChange, onInputRemove }: BlockRendererProps) {
    const def = block.definition;
    const color = def.color;

    const calcBlockHeight = (block: BlockInstance): number => {
        if (block.definition.hasContainer) {
            const innerHeight = Math.max(calcSectionHeight(block.children), 60);
            const tabHeight = block.definition.hasTab ? 8 : 0;
            return 40 + innerHeight + 40 + tabHeight;
        }
        return block.definition.hasTab ? 48 : 40;
    };

    const calcSectionHeight = (children: BlockInstance[]) => {
        if (children.length === 0) return 60;
        let h = 0;
        children.forEach(child => {
            const ch = calcBlockHeight(child);
            const overlap = child.definition.hasTab ? 8 : 0;
            h += ch - overlap;
        });
        return Math.max(h, 60);
    };

    const containerHeight = def.hasContainer ? calcSectionHeight(block.children) : 0;
    const elseHeight = def.hasElse ? calcSectionHeight(block.elseChildren) : 0;

    // Generate SVG path.
    // Clockwise winding. Notch = slot on top edge (drops DOWN). Tab = peg on bottom edge (drops DOWN).
    const generatePath = () => {
        const w = 200;
        const bh = 40;  // header/row height
        const r = 4;    // corner radius
        const nx = 16;  // notch/tab x offset from left

        // Notch: slot in top edge at nx going left->right: arrive at nx, drop 8, go right 8, up 8
        const notchAt = (y: number) => `L ${nx},${y} l 0,8 l 8,0 l 0,-8`;
        // Tab: peg below bottom edge at nx going right->left: arrive at nx+8, drop 8, go left 8, up 8
        const tabAt = (y: number) => `L ${nx + 8},${y} l 0,8 l -8,0 l 0,-8`;
        // Inner notch: children are offset +12 from parent x, so their top notch is at nx+12=28
        const childOffset = 12;
        const innerNotchAt = (_armX: number, y: number) => `L ${nx + childOffset},${y} l 8,0 l 0,8 l -8,0 l 0,-8`;

        let d = '';

        // Top edge (left→right)
        if (def.isHat) {
            d = `M 0,14 Q 0,0 12,0 L ${w - r},0 Q ${w},0 ${w},${r}`;
        } else if (def.hasNotch) {
            d = `M 0,${r} Q 0,0 ${r},0 ${notchAt(0)} L ${w - r},0 Q ${w},0 ${w},${r}`;
        } else {
            d = `M 0,${r} Q 0,0 ${r},0 L ${w - r},0 Q ${w},0 ${w},${r}`;
        }

        if (!def.hasContainer) {
            // ── Regular block ──────────────────────────────────────────────
            d += ` L ${w},${bh - r} Q ${w},${bh} ${w - r},${bh}`;
            if (def.hasTab) {
                d += ` ${tabAt(bh)} L ${r},${bh} Q 0,${bh} 0,${bh - r}`;
            } else {
                d += ` L ${r},${bh} Q 0,${bh} 0,${bh - r}`;
            }
            d += ` L 0,${r} Q 0,0 ${r},0 Z`;
            return d;
        }

        // ── C-block or E-block ─────────────────────────────────────────────
        // True C-shape: right side is a straight vertical line.
        // Only the LEFT side steps in/out to form the inner slot(s).
        //
        //  ┌─────────────────────────┐  y=0       top (with notch)
        //  │  header label           │
        //  │  ┌──────────────────────┘  y=bh      slot 1 opens on left
        //  │  │  children
        //  │  └──────────────────────┐  y=bh+ch   slot 1 closes
        //  │  [else bar - E only]    │             (E-only)
        //  │  ┌──────────────────────┘  y=midBar  slot 2 opens
        //  │  │  else children
        //  │  └──────────────────────┐  y=slotBottom2
        //  │  footer                 │
        //  └─────────────────────────┘  y=totalH  (with tab)

        // C/E shape: arm on LEFT (aw px wide), opens to the RIGHT.
        // Clockwise outline for C-block:
        //   (0,0)→(w,0)→(w,bh)→(aw,bh) [step left at header bottom]
        //   → (aw,slotBottom)→(w,slotBottom) [step right at slot bottom]
        //   → (w,totalH)→(0,totalH)→(0,0)
        // For E-block two slots, same pattern repeated.

        const aw = 8;
        const ch = containerHeight;
        const eh = elseHeight;
        const slotBottom1 = bh + ch;
        const midBar = bh + ch + bh;
        const slotBottom2 = midBar + eh;
        const totalH = def.hasElse ? slotBottom2 + bh : slotBottom1 + bh;

        // After top edge we are at (w, r). Continue down right side.
        // Step LEFT at header bottom to arm inner edge, then down arm, step RIGHT at slot bottom.
        if (def.hasElse) {
            // header right side down
            d += ` L ${w},${bh}`;
            // step LEFT to arm inner edge (header→slot1 transition)
            d += ` L ${aw},${bh}`;
            // inner notch for slot1: protrudes RIGHT, then back to arm edge
            d += ` ${innerNotchAt(aw, bh)} L ${aw},${bh}`;
            // down arm to slot1 bottom
            d += ` L ${aw},${slotBottom1}`;
            // step RIGHT back to full width (slot1→else-bar transition)
            d += ` L ${w},${slotBottom1}`;
            // down else-bar right side
            d += ` L ${w},${midBar}`;
            // step LEFT to arm (else-bar→slot2 transition)
            d += ` L ${aw},${midBar}`;
            // inner notch for slot2: protrudes RIGHT, then back to arm edge
            d += ` ${innerNotchAt(aw, midBar)} L ${aw},${midBar}`;
            // down arm to slot2 bottom
            d += ` L ${aw},${slotBottom2}`;
            // step RIGHT back to full width (slot2→footer transition)
            d += ` L ${w},${slotBottom2}`;
        } else {
            // header right side down
            d += ` L ${w},${bh}`;
            // step LEFT to arm inner edge
            d += ` L ${aw},${bh}`;
            // inner notch for slot: protrudes RIGHT, then back to arm edge
            d += ` ${innerNotchAt(aw, bh)} L ${aw},${bh}`;
            // down arm to slot bottom
            d += ` L ${aw},${slotBottom1}`;
            // step RIGHT back to full width
            d += ` L ${w},${slotBottom1}`;
        }

        // Footer: right side down to corner, bottom edge (right→left), left side up
        d += ` L ${w},${totalH - r} Q ${w},${totalH} ${w - r},${totalH}`;
        if (def.hasTab) {
            d += ` ${tabAt(totalH)} L ${r},${totalH} Q 0,${totalH} 0,${totalH - r}`;
        } else {
            d += ` L ${r},${totalH} Q 0,${totalH} 0,${totalH - r}`;
        }
        // Left side straight up to top-left
        d += ` L 0,${r} Q 0,0 ${r},0 Z`;
        return d;
    };

    const renderLabelParts = () => {
        const parts: (string | React.ReactNode)[] = [];
        let label = def.label;
        let lastIndex = 0;

        // Sort fields and inputs by their position in the label
        const allPlaceholders: { index: number; type: 'field' | 'input'; name: string }[] = [];

        const fieldCount = def.fields?.length ?? 0;

        if (def.fields) {
            def.fields.forEach((field, idx) => {
                allPlaceholders.push({ index: idx + 1, type: 'field', name: field.name });
            });
        }

        if (def.inputs) {
            def.inputs.forEach((inputName, idx) => {
                allPlaceholders.push({ index: fieldCount + idx + 1, type: 'input', name: inputName });
            });
        }

        allPlaceholders.sort((a, b) => a.index - b.index);

        allPlaceholders.forEach((placeholder) => {
            const placeholderStr = `%${placeholder.index}`;
            const placeholderIndex = label.indexOf(placeholderStr, lastIndex);

            if (placeholderIndex > -1) {
                // Add text before placeholder
                parts.push(label.slice(lastIndex, placeholderIndex));

                if (placeholder.type === 'field') {
                    const field = def.fields!.find(f => f.name === placeholder.name);
                    if (field) {
                        const value = block.fields[field.name] ?? field.value ?? '';
                        parts.push(renderField(field, value));
                    }
                } else if (placeholder.type === 'input') {
                    const inputBlock = block.inputs[placeholder.name];
                    if (inputBlock) {
                        parts.push(
                            <div
                                key={placeholder.name}
                                className="inline-block align-middle"
                                data-connected-input={placeholder.name}
                                data-parent-block-id={block.id}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const target = e.target as Node;
                                    const targetEl = target instanceof Element ? target : target.parentElement;
                                    if (targetEl?.closest('input, select, textarea, [contenteditable]')) {
                                        return;
                                    }
                                    onInputRemove?.(block.id, placeholder.name);
                                }}
                            >
                                <BlockRenderer block={inputBlock} onFieldChange={onFieldChange} onInputRemove={onInputRemove} />
                            </div>
                        );
                    } else {
                        // Empty input slot — shape hint matches what can snap in
                        parts.push(
                            <span
                                key={placeholder.name}
                                data-input-slot={placeholder.name}
                                data-parent-block-id={block.id}
                                className="inline-flex items-center justify-center align-middle mx-0.5 text-white/60 text-[9px] select-none"
                                style={{
                                    width: 40,
                                    height: 20,
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: 10,
                                    cursor: 'default',
                                }}
                            />
                        );
                    }
                }

                lastIndex = placeholderIndex + placeholderStr.length;
            }
        });

        // Add remaining text
        parts.push(label.slice(lastIndex));

        return parts;
    };

    const renderField = (field: any, value: any) => {
        if (field.type === 'number') {
            return (
                <input
                    type="number"
                    value={value}
                    className="w-12 h-6 rounded bg-white text-black text-xs px-1"
                    onChange={(e) => onFieldChange?.(field.name, parseFloat(e.target.value))}
                />
            );
        } else if (field.type === 'string') {
            return (
                <input
                    type="text"
                    value={value}
                    className="w-20 h-6 rounded bg-white text-black text-xs px-1"
                    onChange={(e) => onFieldChange?.(field.name, e.target.value)}
                />
            );
        } else if (field.type === 'dropdown') {
            return (
                <select
                    className="w-16 h-6 rounded bg-white text-black text-xs px-1"
                    value={value}
                    onChange={(e) => onFieldChange?.(field.name, e.target.value)}
                >
                    {field.options?.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        } else if (field.type === 'color') {
            return (
                <input
                    type="color"
                    value={String(value) || '#ff0000'}
                    className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent"
                    onChange={(e) => onFieldChange?.(field.name, e.target.value)}
                />
            );
        } else if (field.type === 'sprite' || field.type === 'broadcast' || field.type === 'effect' || field.type === 'mathop' || field.type === 'stopOption') {
            return (
                <select
                    className="w-20 h-6 rounded bg-white text-black text-xs px-1"
                    value={String(value)}
                    onChange={(e) => onFieldChange?.(field.name, e.target.value)}
                >
                    {field.options?.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    )) ?? <option value={String(value)}>{String(value)}</option>}
                </select>
            );
        } else if (field.type === 'key') {
            return (
                <select
                    className="w-20 h-6 rounded bg-white text-black text-xs px-1"
                    value={String(value)}
                    onChange={(e) => onFieldChange?.(field.name, e.target.value)}
                >
                    {(field.options ?? KEY_OPTIONS).map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );
        }
        return String(value);
    };

    const shape = def.shape ?? 'stack';

    // ── Reporter block (oval) ──────────────────────────────────────────
    if (shape === 'reporter') {
        const rw = 80; const rh = 28;
        return (
            <div className="relative select-none inline-block" style={{ width: rw, height: rh, opacity: isDragging ? 0.8 : 1, cursor: 'grab' }}>
                <svg width={rw} height={rh} className="absolute inset-0 pointer-events-none" style={{ transform: 'translate(1px,1px)' }}>
                    <rect x="0" y="0" width={rw} height={rh} rx={rh / 2} ry={rh / 2} fill="rgba(0,0,0,0.15)" />
                </svg>
                <svg width={rw} height={rh} className="absolute inset-0 pointer-events-none">
                    <rect x="0" y="0" width={rw} height={rh} rx={rh / 2} ry={rh / 2} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center px-3 text-white text-xs font-medium gap-1"
                    style={{ fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif" }}>
                    {renderLabelParts()}
                </div>
            </div>
        );
    }

    // ── Boolean block (hexagon / pointed oval) ─────────────────────────
    if (shape === 'boolean') {
        const bw = 80; const bh2 = 28; const pt = 8;
        // Hexagon path: left point, top-left corner, top-right corner, right point, bottom-right, bottom-left
        const hexPath = `M ${pt},0 L ${bw - pt},0 L ${bw},${bh2 / 2} L ${bw - pt},${bh2} L ${pt},${bh2} L 0,${bh2 / 2} Z`;
        return (
            <div className="relative select-none inline-block" style={{ width: bw, height: bh2, opacity: isDragging ? 0.8 : 1, cursor: 'grab' }}>
                <svg width={bw} height={bh2} className="absolute inset-0 pointer-events-none" style={{ transform: 'translate(1px,1px)' }}>
                    <path d={hexPath} fill="rgba(0,0,0,0.15)" />
                </svg>
                <svg width={bw} height={bh2} className="absolute inset-0 pointer-events-none">
                    <path d={hexPath} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center px-3 text-white text-xs font-medium gap-1"
                    style={{ fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif" }}>
                    {renderLabelParts()}
                </div>
            </div>
        );
    }

    const tabHeight = def.hasTab ? 8 : 0;
    const totalHeight = def.hasContainer
        ? def.hasElse
            ? 40 + containerHeight + 40 + elseHeight + 40 + tabHeight  // E-block
            : 40 + containerHeight + 40 + tabHeight                    // C-block
        : 40 + tabHeight;

    return (
        <div
            className="relative select-none"
            style={{
                width: 200,
                height: totalHeight,
                opacity: isDragging ? 0.8 : 1,
                cursor: 'grab',
            }}
        >
            {/* Shadow layer */}
            <svg
                width="200"
                height={totalHeight}
                className="absolute inset-0 pointer-events-none"
                style={{ transform: 'translate(2px, 2px)' }}
            >
                <path
                    d={generatePath()}
                    fill="rgba(0,0,0,0.15)"
                />
            </svg>

            {/* Main block */}
            <svg
                width="200"
                height={totalHeight}
                className="absolute inset-0 pointer-events-none"
            >
                <path
                    d={generatePath()}
                    fill={color}
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="1"
                />
            </svg>

            {/* Text label - positioned in header for container blocks */}
            <div
                className="absolute flex items-center px-3 text-white text-sm font-medium gap-1"
                style={{
                    fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
                    top: def.hasContainer ? 2 : 0,
                    height: def.hasContainer ? 36 : '100%',
                    left: 0,
                    right: 0,
                }}
            >
                {renderLabelParts()}
            </div>

            {/* Else label row - rendered on the SVG shape, children positioned by workspace */}
            {def.hasElse && (
                <div
                    className="absolute flex items-center px-3 text-white text-sm font-medium pointer-events-none"
                    style={{
                        fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif",
                        top: 40 + containerHeight,
                        height: 40,
                        left: 0,
                        right: 0,
                    }}
                >
                    else
                </div>
            )}
        </div>
    );
}
