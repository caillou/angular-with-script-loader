import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';

declare global {
  interface Window {
    mcs?: any;
  }
}

@UntilDestroy()
@Component({
  selector: 'app-root',
  // todo: add the loading indicator
  template: '<div #mdcf></div>',
  styleUrls: [],
})
export class AppComponent implements AfterViewInit {
  title = 'my-app';

  @ViewChild('mdcf') mdcfDiv?: ElementRef<HTMLDivElement>;

  scriptIsLoaded$ = new BehaviorSubject(false);

  // todo: config and method should be passed in as inputs
  config = {
    language: 'de',
    calendarId: '2Mlnpm0763B9kNeyJeni',
  };
  method = 'calendar';

  constructor() {
    var head = document.head;

    // todo: move this into a service that ensures that the script is only loaded once

    fetch('https://digital-campaign-factory.migros.ch/api/version')
      .then((response) => response.json())
      .then(({ version }) => {
        var script = document.createElement('script');
        const src =
          'https://digital-campaign-factory.migros.ch/static-widgets/%version%/main.js'.replace(
            '%version%',
            version
          );

        script.type = 'text/javascript';
        script.src = src;

        script.onload = () => {
          this.scriptIsLoaded$.next(true);
        };

        head.appendChild(script);
      });
  }

  ngAfterViewInit(): void {
    this.scriptIsLoaded$.pipe(untilDestroyed(this)).subscribe((loaded) => {
      if (!loaded) {
        return;
      }

      if (!this.mdcfDiv) {
        throw new Error('mdcfDiv not found');
      }

      window.mcs?.[this.method]?.(this.mdcfDiv.nativeElement, this.config);
    });
  }
}
