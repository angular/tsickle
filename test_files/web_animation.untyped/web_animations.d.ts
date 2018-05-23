// Type definitions for web-animations-js 2.2
// Project: https://github.com/web-animations/web-animations-js
// Definitions by: Kristian Moerch <https://github.com/kritollm>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

type AnimationEffectTimingFillMode = "none" | "forwards" | "backwards" | "both" | "auto";
type AnimationEffectTimingPlaybackDirection = "normal" | "reverse" | "alternate" | "alternate-reverse";
type AnimationPlayState = "idle" | "running" | "paused" | "finished";

interface AnimationPlaybackEvent {
    target: Animation;
    type: string;
    bubbles: boolean;
    cancelable: boolean;
    currentTarget: Animation;
    defaultPrevented: boolean;
    eventPhase: number;
    timeStamp: number;
}

interface AnimationKeyFrame {
    opacity?: number | number[];
    transform?: string |  string[];
}

interface AnimationTimeline {
    getAnimations(): Animation[];
    play(effect: KeyframeEffect): Animation;
}
interface AnimationEffectTiming {
    delay?: number;
    direction?: AnimationEffectTimingPlaybackDirection;
    duration?: number;
    easing?: string;
    endDelay?: number;
    fill?: AnimationEffectTimingFillMode;
    iterationStart?: number;
    iterations?: number;
    playbackRate?: number;
}

declare class KeyframeEffect implements AnimationEffectReadOnly {
    constructor(target: HTMLElement, effect: AnimationKeyFrame | AnimationKeyFrame[], timing: number | AnimationEffectTiming, id?: string);
    activeDuration: number;
    onsample: (timeFraction: number | null, effect: KeyframeEffect, animation: Animation) => void | undefined;
    parent: KeyframeEffect | null;
    target: HTMLElement;
    timing: number;
    getComputedTiming(): ComputedTimingProperties;
    getFrames(): AnimationKeyFrame[];
    remove(): void;
}
type AnimationEventListener = (this: Animation, evt: AnimationPlaybackEvent) => any;

interface Animation extends EventTarget {
    addEventListener(type: "finish" | "cancel", handler: EventListener): void;
    removeEventListener(type: "finish" | "cancel", handler: EventListener): void;
}

declare class SequenceEffect extends KeyframeEffect {
    constructor(effects: KeyframeEffect[]);
}
declare class GroupEffect extends KeyframeEffect {
    constructor(effects: KeyframeEffect[]);
}
interface Element {
    animate(effect: AnimationKeyFrame | AnimationKeyFrame[], timing: number | AnimationEffectTiming): Animation;
    getAnimations(): Animation[];
}
interface Document {
    timeline: AnimationTimeline;
}