export interface Question {
    keywords: string[];
    answer: string;
}

export const answers = {
    aboutMe:
        "I'm Emmanuella, a passionate frontend developer who loves creating engaging user interfaces and building beautiful web applications. I specialize in React and other modern web technologies.",
    projectDescription:
        'This project is a portfolio that highlights my experience and skills as a frontend developer, showcasing my work and projects in web development.',
    techStack:
        'I use modern technologies like Angular, React, NextJs, TypeScript, HTML5, CSS3, SCSS, and JavaScript. I also work with tools like Docker, GraphQL, and libraries like Framer Motion for animations.',

    favoriteLanguage:
        'My favorite programming language is JavaScript because of its versatility and the vast ecosystem of libraries and frameworks like React and Node.js. I also enjoy working with TypeScript for its type safety and scalability.',
    portfolioWalkthrough:
        'Sure! My portfolio is divided into several sections: 1) About Me, where I introduce myself and my skills; 2) Projects, where I showcase my work with details about the technologies used; 3) Contact, where you can reach out to me. Each project includes a description, technologies used, and a link to the live demo or GitHub repository.',
    reactExperience:
        'I have extensive experience working with React, including building dynamic user interfaces, managing state with Redux, and optimizing performance using React.memo and useCallback.',
    backendExperience:
        'While my primary focus is frontend development, I have experience working with backend technologies like Node.js, Express, and databases like MongoDB and Firebase.',
    designProcess:
        'My design process starts with understanding user needs, creating wireframes and prototypes, and iterating based on feedback. I use tools like Figma and Adobe XD for design and collaboration.',
    accessibility:
        'I prioritize accessibility by following WCAG guidelines, using semantic HTML, ARIA attributes, and testing with screen readers and accessibility tools like Lighthouse.',
    challengingProject:
        'One challenging project involved building a real-time chat application with WebSockets. I had to optimize performance for high traffic and ensure seamless communication between users.',
};

export const predefinedResponses: { [x: string]: string } = {
    'tell me about emmanuella': answers.aboutMe,
    'about her': answers.aboutMe,
    'who is emmanuella': answers.aboutMe,

    hi: 'Hello! How can I help you today?',
    hello: 'Hi there! What can I do for you?',
    hey: "Hey! What's on your mind?",

    'what’s this project about': answers.projectDescription,
    'describe this project': answers.projectDescription,
    'portfolio details': answers.projectDescription,

    'what technologies does she use': answers.techStack,
    'tech stack': answers.techStack,
    'programming languages': answers.techStack,

    'what’s your favorite programming language': answers.favoriteLanguage,
    'favorite programming language': answers.favoriteLanguage,
    'which language do you prefer': answers.favoriteLanguage,

    'walk me through your portfolio': answers.portfolioWalkthrough,
    'tell me about your portfolio': answers.portfolioWalkthrough,
    'explain your portfolio': answers.portfolioWalkthrough,

    'what’s your experience with React': answers.reactExperience,
    'do you have experience with backend development':
        answers.backendExperience,
    'what’s your design process': answers.designProcess,
    'how do you handle accessibility in your projects': answers.accessibility,
    'can you describe a challenging project you worked on':
        answers.challengingProject,
};
export const fallbackResponses: string[] = [
    "I'm here to chat about Emmanuella and programming. Ask me something related!",
    'That’s outside my expertise! But I can tell you about programming or Emmanuella’s work.',
    'I specialize in programming and Emmanuella-related topics. What would you like to know?',
    'I can answer questions about coding and Emmanuella. Need help with anything in that area?',
    'Hmm, I only respond to programming and Emmanuella-related queries. Try something else!',
];
