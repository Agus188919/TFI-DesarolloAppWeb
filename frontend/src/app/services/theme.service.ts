import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    isDarkMode = signal<boolean>(false);

    constructor() {
        this.initTheme();
    }

    private initTheme(): void {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const dark = savedTheme ? savedTheme === 'dark' : prefersDark;
        this.setDarkMode(dark);
    }

    toggleTheme(): void {
        this.setDarkMode(!this.isDarkMode());
    }

    private setDarkMode(dark: boolean): void {
        this.isDarkMode.set(dark);
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
}