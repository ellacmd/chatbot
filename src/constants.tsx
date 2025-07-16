export interface Question {
    keywords: string[];
    answer: string;
}

export const answers = {
    aboutMe: `I'm Emmanuella, a passionate frontend developer with a keen eye for creating engaging user interfaces and building beautiful web applications. I specialize in React, Angular, and modern web technologies.

Key highlights:
• Frontend Development Specialist
• React & Angular Expert
• TypeScript Enthusiast
• UI/UX Focus
• Problem Solver

When I'm not coding, you can find me playing chess or CODM, which helps me develop strategic thinking and quick decision-making skills.`,

    projectDescription: `This portfolio showcases my journey as a frontend developer, featuring:

• Interactive Projects: Real-world applications built with modern technologies
• Technical Blog: Insights and tutorials about web development
• Case Studies: Detailed breakdowns of challenging projects
• Skills Showcase: Comprehensive overview of my technical expertise
• Contact Information: Multiple ways to reach out for opportunities

Feel free to explore and ask me about any specific project or technology!`,

    techStack: `My technical arsenal includes:

Frontend:
• React, Angular, Next.js
• TypeScript, JavaScript
• HTML5, CSS3, SCSS
• Redux, Context API
• Framer Motion

Tools & Technologies:
• Git, GitHub
• Docker
• GraphQL
• REST APIs
• Jest, React Testing Library

I'm constantly learning and adding new technologies to my stack!`,

    favoriteLanguage: `TypeScript is my go-to language because:
• Strong type safety prevents runtime errors
• Better IDE support and autocompletion
• Enhanced code maintainability
• Great for large-scale applications
• Seamless integration with React and Angular

I also love JavaScript for its flexibility and the vast ecosystem of libraries and frameworks.`,

    portfolioWalkthrough: `Let me walk you through my portfolio:

1. About Me
   • Professional background
   • Skills and expertise
   • Personal interests

2. Projects
   • Live demos
   • GitHub repositories
   • Case studies
   • Technologies used

3. Blog
   • Technical articles
   • Tutorials
   • Industry insights

4. Contact
   • Email
   • LinkedIn
   • GitHub
   • Social media

Would you like to know more about any specific section?`,

    reactExperience: `My React expertise includes:

• Building complex SPAs
• State management (Redux, Context)
• Performance optimization
• Custom hooks
• Component architecture
• Testing and debugging
• Server-side rendering
• Progressive Web Apps

I've worked on various React projects, from small business websites to large-scale applications.`,

    backendExperience: `While frontend is my primary focus, I have solid backend experience:

• Node.js and Express
• RESTful API design
• MongoDB and Firebase
• Authentication systems
• Database optimization
• API integration
• Basic DevOps

This full-stack knowledge helps me build more efficient and scalable applications.`,

    designProcess: `My design process follows these steps:

1. Research & Analysis
   • User needs
   • Market research
   • Competitor analysis

2. Planning
   • Wireframing
   • User flows
   • Information architecture

3. Design
   • UI/UX design
   • Prototyping
   • User testing

4. Development
   • Clean code
   • Performance optimization
   • Accessibility

5. Testing & Iteration
   • User feedback
   • Performance testing
   • Continuous improvement`,

    accessibility: `I prioritize accessibility through:

• WCAG 2.1 compliance
• Semantic HTML
• ARIA attributes
• Keyboard navigation
• Screen reader compatibility
• Color contrast
• Responsive design
• Performance optimization

I regularly test with tools like Lighthouse and screen readers to ensure inclusivity.`,

    challengingProject: `One of my most challenging projects was a real-time chat application:

Challenges:
• WebSocket implementation
• Real-time data synchronization
• Performance optimization
• Security measures
• Cross-browser compatibility

Solutions:
• Implemented efficient state management
• Used WebSocket for real-time communication
• Optimized database queries
• Added end-to-end encryption
• Implemented fallback mechanisms

The project taught me valuable lessons about scalability and real-time application development.`,

    education: `My educational background includes:

• Bachelor's in Computer Science
• Various online certifications
• Continuous learning through:
  - Online courses
  - Technical workshops
  - Industry conferences
  - Open source contributions`,

    hobbies: `When I'm not coding, I enjoy:

• Playing chess (helps with strategic thinking)
• CODM gaming (improves quick decision-making)
• Reading tech blogs
• Contributing to open source
• Learning new technologies
• Participating in hackathons`,

    contact: `You can reach me through:

• Email: emmanuellaenomah@gmail.com
• LinkedIn: [linkedin.com/in/emmanuellaenomah](https://linkedin.com/in/emmanuellaenomah)
• GitHub: [github.com/emmanuellaenomah](https://github.com/emmanuellaenomah)
• Portfolio: [emmanuellaenomah.com](https://emmanuellaenomah.com)

I'm always open to new opportunities and collaborations!`,
};

export const predefinedResponses: { [x: string]: string } = {
    'tell me about emmanuella': answers.aboutMe,
    'about her': answers.aboutMe,
    'who is emmanuella':
        'Emmanuella is a passionate frontend developer who loves creating engaging user interfaces and building beautiful web applications. She specializes in React and other modern web technologies.',
    'what is your background': answers.aboutMe,

    hi: "👋 Hello! I'm here to tell you about Emmanuella and her work. What would you like to know?",
    hello: "👋 Hi there! Ask me anything about Emmanuella's projects or programming!",
    hey: "👋 Hey! I'm excited to share information about Emmanuella's work. What interests you?",

    "what's this project about": answers.projectDescription,
    'describe this project': answers.projectDescription,
    'portfolio details': answers.projectDescription,
    'tell me about this portfolio': answers.projectDescription,

    'what technologies does she use': answers.techStack,
    'tech stack': answers.techStack,
    'programming languages': answers.techStack,
    'what tools do you use': answers.techStack,

    "what's your favorite programming language": answers.favoriteLanguage,
    'favorite programming language': answers.favoriteLanguage,
    'which language do you prefer': answers.favoriteLanguage,
    'best programming language': answers.favoriteLanguage,

    'walk me through your portfolio': answers.portfolioWalkthrough,
    'tell me about your portfolio': answers.portfolioWalkthrough,
    'explain your portfolio': answers.portfolioWalkthrough,
    'how is your portfolio organized': answers.portfolioWalkthrough,

    "what's your experience with React": answers.reactExperience,
    'react experience': answers.reactExperience,
    'do you know React': answers.reactExperience,

    'do you have experience with backend development':
        answers.backendExperience,
    'backend skills': answers.backendExperience,
    'server-side experience': answers.backendExperience,

    "what's your design process": answers.designProcess,
    'how do you design': answers.designProcess,
    'design methodology': answers.designProcess,

    'how do you handle accessibility': answers.accessibility,
    'accessibility practices': answers.accessibility,
    'a11y experience': answers.accessibility,

    'can you describe a challenging project': answers.challengingProject,
    'toughest project': answers.challengingProject,
    'most difficult project': answers.challengingProject,

    "what's your education": answers.education,
    'educational background': answers.education,
    'where did you study': answers.education,

    'what are your hobbies': answers.hobbies,
    'what do you do for fun': answers.hobbies,
    'interests outside coding': answers.hobbies,

    'how can I contact you': answers.contact,
    'contact information': answers.contact,
    'ways to reach you': answers.contact,
};

export const suggestedQuestions = [
    'Tell me about Emmanuella',
    'What technologies do you use?',
    'Show me your projects',
    "What's your design process?",
    'How can I contact you?',
    'Tell me about your React experience',
    'What are your hobbies?',
    'Describe a challenging project',
];

export const fallbackResponses: string[] = [
    "I'm here to chat about Emmanuella and programming. Ask me something related!",
    "That's outside my expertise! But I can tell you about programming or Emmanuella's work.",
    'I specialize in programming and Emmanuella-related topics. What would you like to know?',
    'I can answer questions about coding and Emmanuella. Need help with anything in that area?',
    'Hmm, I only respond to programming and Emmanuella-related queries. Try something else!',
    "Let's focus on Emmanuella's work and programming. What would you like to learn?",
    "I'm your guide to Emmanuella's portfolio and programming knowledge. What interests you?",
    "I can help you learn about Emmanuella's projects and programming. What's your question?",
];
