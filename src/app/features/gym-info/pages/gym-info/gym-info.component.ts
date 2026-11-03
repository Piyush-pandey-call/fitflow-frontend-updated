import { AfterViewInit, Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface GymInfoCard {
  title: string;
  description: string;
}

interface GymInfoPage {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  sections: GymInfoCard[];
  highlights: GymInfoCard[];
  nextSteps: GymInfoCard[];
  note: string;
}

const GYM_INFO_PAGES: Record<string, GymInfoPage> = {
  about: {
    eyebrow: 'A PLACE TO MOVE FORWARD',
    title: 'What is a gym?',
    intro:
      'A gym is a dedicated space where people can exercise, learn about movement, and build a routine that fits their goals and day-to-day life.',
    image: '/assets/gym-strength.jpg',
    imageAlt: 'Free weights and training floor inside a gym',
    sections: [
      {
        title: 'A space for movement',
        description:
          'A gym brings training equipment, open floor space, and a place to focus into one dedicated environment. Depending on the facility, you may find strength machines, free weights, cardio equipment, and studios for classes.',
      },
      {
        title: 'A routine that is yours',
        description:
          'There is no single “right” way to spend a session. Some people follow a written plan, while others take a class, use a cardio machine, practice mobility, or combine a few activities.',
      },
      {
        title: 'Progress at your pace',
        description:
          'A comfortable starting point makes it easier to learn the space and build a repeatable habit. Ask staff for an orientation, then increase the challenge gradually as you gain confidence.',
      },
      {
        title: 'Equipment for different goals',
        description:
          'Gyms may include resistance machines, dumbbells, barbells, cable stations, treadmills, bikes, and functional training tools. Check what is available and whether an introduction is offered.',
      },
      {
        title: 'Support and shared energy',
        description:
          'Staff, coaches, and other members can make a gym feel welcoming. Ask about beginner support, group activities, and how the team helps members use equipment safely.',
      },
      {
        title: 'A place to reset',
        description:
          'For many people, a gym is a dedicated break in the day—a place to move, focus, and leave everyday distractions behind. Choose an environment where you feel comfortable returning.',
      },
    ],
    highlights: [
      { title: 'Move your way', description: 'Choose from equipment, classes, or a mix of activities.' },
      { title: 'Learn the space', description: 'Ask about tours, orientations, and beginner guidance.' },
      { title: 'Build a rhythm', description: 'Start with a schedule that fits your real life.' },
    ],
    nextSteps: [
      { title: 'Visit at your usual time', description: 'See how busy the gym feels when you would normally train.' },
      { title: 'Try the essentials', description: 'Ask which equipment and spaces are included with membership.' },
      { title: 'Ask about support', description: 'Find out who can help you learn the equipment and facility.' },
    ],
    note: 'Every gym is different. Ask about equipment, opening hours, accessibility, and support before choosing a facility.',
  },
  training: {
    eyebrow: 'EXPLORE YOUR OPTIONS',
    title: 'Different ways to train',
    intro:
      'A gym can offer several ways to move. Explore what is available locally and choose activities that suit your interests, experience, and schedule.',
    image: '/assets/gym-coaching.jpg',
    imageAlt: 'Athlete exercising on a mat in a bright training space',
    sections: [
      {
        title: 'Strength and resistance',
        description:
          'Free weights, resistance machines, or bodyweight movements can be part of a strength-focused routine. Ask staff to explain unfamiliar equipment.',
      },
      {
        title: 'Cardio and conditioning',
        description:
          'Treadmills, cycles, rowing machines, and group activities are common options for getting your heart rate up. Pick an intensity that feels appropriate for you.',
      },
      {
        title: 'Mobility and flexibility',
        description:
          'Stretching, mobility work, and mind-body classes can complement other activities. Ask about beginner sessions and whether the gym has a quieter area for this type of training.',
      },
      {
        title: 'Functional and group training',
        description:
          'Some facilities run coached circuits, small-group sessions, or functional workouts using tools such as ropes, bands, and bodyweight movements. Class size and booking rules vary.',
      },
      {
        title: 'Coached sessions',
        description:
          'A qualified coach may help you learn movement patterns, adapt exercises, and structure a plan around your experience. Confirm credentials, session costs, and what coaching includes.',
      },
      {
        title: 'A balanced weekly plan',
        description:
          'A training week can combine different movement styles and rest days. Start with a manageable schedule, notice how you feel, and make changes gradually rather than trying to do everything at once.',
      },
    ],
    highlights: [
      { title: 'Strength', description: 'Machines, free weights, and bodyweight movements.' },
      { title: 'Conditioning', description: 'Cardio equipment and coached group formats.' },
      { title: 'Mobility', description: 'Stretching, recovery, and mind-body activities.' },
    ],
    nextSteps: [
      { title: 'Start with an introduction', description: 'Ask for a walkthrough before using unfamiliar equipment.' },
      { title: 'Choose a realistic pace', description: 'Build sessions around your experience and weekly schedule.' },
      { title: 'Check class details', description: 'Confirm timings, booking, equipment, and any extra charges.' },
    ],
    note: 'Not every facility offers every activity. Check the gym’s current timetable and ask about beginner-friendly guidance.',
  },
  benefits: {
    eyebrow: 'WHY MAKE TIME FOR FITNESS?',
    title: 'Reasons people join a gym',
    intro:
      'Joining a gym can make it easier to set aside time for movement and find a routine that feels rewarding. Your reasons—and results—are personal.',
    image: '/assets/gym-community-training.jpg',
    imageAlt: 'Athlete training with battle ropes',
    sections: [
      {
        title: 'Create consistency',
        description:
          'A regular place to exercise can help turn “I should work out” into a planned part of the week. Choose days and times you can realistically keep.',
      },
      {
        title: 'Keep your routine varied',
        description:
          'Different equipment and activities give you options when you want to try something new or adapt your routine to the day.',
      },
      {
        title: 'Feel supported',
        description:
          'Some gyms provide staff, trainers, or group sessions to help members get oriented. Ask what guidance is included and how to get help when you need it.',
      },
      {
        title: 'Find a sense of community',
        description:
          'Classes and shared spaces can make it easier to meet people with similar interests. A friendly environment can make showing up feel more enjoyable.',
      },
      {
        title: 'Make time for yourself',
        description:
          'A planned visit can become a protected part of your day. Whether your goal is energy, strength, confidence, or simply a change of pace, make the routine personal.',
      },
      {
        title: 'Explore at your own speed',
        description:
          'You do not need to know every machine or activity before joining. Start with what feels familiar, ask questions, and try new options when you are ready.',
      },
    ],
    highlights: [
      { title: 'Consistency', description: 'Give movement a regular place in your week.' },
      { title: 'Choice', description: 'Switch between different spaces and activities.' },
      { title: 'Encouragement', description: 'Find guidance and community that suit you.' },
    ],
    nextSteps: [
      { title: 'Name your reason', description: 'Choose a goal that feels meaningful to you, not someone else.' },
      { title: 'Make it convenient', description: 'Consider travel time and opening hours before you commit.' },
      { title: 'Notice what works', description: 'Review your routine and adjust it as your needs change.' },
    ],
    note: 'Exercise experiences differ for each person. If you have health concerns or are new to exercise, consult a qualified professional before beginning.',
  },
  membership: {
    eyebrow: 'CHOOSE WITH CONFIDENCE',
    title: 'Find a membership that fits',
    intro:
      'The right membership is one you understand and can use. Compare the details, visit if possible, and make sure the gym works for your routine.',
    image: '/assets/gym-interior.jpg',
    imageAlt: 'Bright gym interior with strength and cardio equipment',
    sections: [
      {
        title: 'Compare the essentials',
        description:
          'Review the total price, billing schedule, opening hours, included services, cancellation terms, and any joining or maintenance fees.',
      },
      {
        title: 'See the space for yourself',
        description:
          'A visit can help you understand the atmosphere, equipment, cleanliness, accessibility, and how busy the gym gets at the times you plan to go.',
      },
      {
        title: 'Start with a simple plan',
        description:
          'Set a small first-month goal, learn the basics, and build your schedule gradually. Ask what a trial visit, induction, or first-month support includes.',
      },
      {
        title: 'Check access and availability',
        description:
          'Confirm opening hours, peak-time access, class booking, guest policies, and whether your chosen plan covers all areas and activities you expect to use.',
      },
      {
        title: 'Understand how billing works',
        description:
          'Check when your first payment is due, how renewals are handled, whether payments recur automatically, and how to update your payment details.',
      },
      {
        title: 'Know your options if plans change',
        description:
          'Read the cancellation, pause, transfer, and refund terms before signing. Ask the gym to explain any notice periods or fees in writing.',
      },
    ],
    highlights: [
      { title: 'Total cost', description: 'Compare the complete price, not just the advertised rate.' },
      { title: 'Everyday access', description: 'Match hours, location, and facilities to your routine.' },
      { title: 'Clear terms', description: 'Understand renewals, pauses, and cancellation in advance.' },
    ],
    nextSteps: [
      { title: 'Compare two or three options', description: 'Use the same checklist so the costs and facilities are easy to compare.' },
      { title: 'Read the agreement', description: 'Take time to review the full membership terms before paying.' },
      { title: 'Keep your confirmation', description: 'Save receipts, contract details, and support contact information.' },
    ],
    note: 'Membership terms are set by each gym. Read the agreement and confirm any questions directly with the facility before joining.',
  },
};

const PAGE_LINKS = [
  { label: 'About the gym', path: '/gym/about' },
  { label: 'Training', path: '/gym/training' },
  { label: 'Benefits', path: '/gym/benefits' },
  { label: 'Membership', path: '/gym/membership' },
];

@Component({
  selector: 'app-gym-info',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gym-info.component.html',
  styleUrl: './gym-info.component.css',
})
export class GymInfoComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private revealObserver?: IntersectionObserver;

  readonly links = PAGE_LINKS;
  readonly page = signal<GymInfoPage>(GYM_INFO_PAGES['about']);
  readonly currentPage = signal('');

  constructor() {
    this.route.data.subscribe((data) => {
      const pageKey = data['page'];
      const page = typeof pageKey === 'string' ? GYM_INFO_PAGES[pageKey] : undefined;
      if (!page) {
        void this.router.navigateByUrl('/');
        return;
      }
      this.page.set(page);
      this.currentPage.set(pageKey);
    });
  }

  ngAfterViewInit(): void {
    const revealTargets = document.querySelectorAll<HTMLElement>('.gym-guide .guide-reveal');
    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach((target) => target.classList.add('is-visible'));
      return;
    }
    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    revealTargets.forEach((target) => this.revealObserver?.observe(target));
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }
}
