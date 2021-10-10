(async function() {
  let goals = await fetch("/api/user")
  .then(response => response.json())
  .then(data => {
    data.goals.push({
      title: "Create a goal!",
      desc: "Create a new goal for your personal health!",
      completed: false,
      completeBy: null,
      urgency: 0,
      created: null,
      progress: [],
      url: "/pages/create-goal"
    });
    
    return data.goals.map(x => {
        if(!x.url) x.url = "/pages/goal/" + encodeURIComponent(x.title.replace(/\s/g, "-")).toLowerCase();

        return x;
      }).sort((a, b) => Number(a.urgency) > Number(b.urgency));
  });

  var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello',
      loading: false,
      showTip: false,
      random: 0,
      quote: "Our bodies are our garden to which our wills are gardeners.",
      quotes: ["Our bodies are our garden to which our wills are gardeners.", 
        "Caring for your body, mind, and spirit is your greatest and grandest responsibility. It’s about listening to the needs of your soul and then honoring them.",
        "Nourishing yourself in a way that helps you blossom in the direction you want to go is attainable, and you are worth the effort",
        "With every act of self-care your authentic self gets stronger, and the critical, fearful mind gets weaker. Every act of self-care is a powerful declaration: I am on my side, I am on my side, each day I am more and more on my own side.",
        "There’s only one corner of the universe you can be certain of improving, and that’s your own self",
        "Sometimes the most important thing in a whole day is the rest we take between two deep breaths.",
        "How we care for ourselves gives our brain messages that shape our self-worth so we must care for ourselves in every way, every day.",
        "Caring for myself is not self-indulgence, it is self-preservation, and that is an act of political warfare."],
      person: "William Shakespeare",
      persons: ["William Shakespeare", "Kristi Ling", "Deborah Day", "Susan Weiss Berry", "Aldous Huxley", "Etty Hillesum", "Sam Owen", "Audre Lorde"],
      tools: [
        {
          name: "Daily Sleep Tracker",
          des: "A good sleep is essential. Track your sleep here.",
          link: "/pages/sleep-track",
          linkname: "Go to tool",
          styling: {
              color: '#ff5a1f'
          },
          class: ['bx bxs-sleepy', 'tool-ico']
        },
        {
          name: "Healthy Food Suggestion",
          des: "Get good food recommendations.",
          link: "/pages/food-suggest",
          linkname: "Go to tool",
          styling: {
              color: '#0694a2'
          },
          class: ['bx bxs-cookie', 'tool-ico']
        },
        {
          name: "Inspire Yourself",
          des: "Get a shower of motivational quotes.",
          link: "/pages/inspire",
          linkname: "Go to tool",
          styling: {
              color: '#3f83f8'
          },
          class: ['bx bxs-donate-heart', 'tool-ico']
        },
        {
          name: "Good Self-Care",
          des: "Maintain a healthy lifestyle.",
          link: "/pages/self-care",
          linkname: "Go to tool",
          styling: {
              color: '#0e9f6e'
          },
          class: ['bx bxs-smile', 'tool-ico']
        },
        {
          name: "Meditate",
          des: "Keep your brain fresh.",
          link: "/pages/meditate",
          linkname: "Go to tool",
          styling: {
              color: '#4954a3'
          },
          class: ['bx bxs-brain', 'tool-ico']
        }
        
      ],
      goals: goals,
      articles: [
        {

          src: "../../resources/images/laptop.jpg",
          title: "How to use this website?",
          p: "Using this site is very easy, everything is on your screen...",
          linked: "/pages/self-care/article1",
          link: "/pages/self-care",
          type: "basic",
          styling: {
            color: '#ff5a1f'
          },
          class: "bx bx-book"
        },
        {
          src: "../../resources/images/selfcare.jpg",
          title: "What is Self Care",
          p: "Self-care doesn't mean to be selfish but instead it means to be...",
          linked: "/pages/self-care/article3",
          link: "/pages/self-care#sc",
          type: "self-care",
           styling: {
            color: '#0694a2'
          },
          class: "bx bx-happy-alt"
        },
        {
          src: "../../resources/images/fitness.jpg",
          title: "Fitness during Quarantine",
          p: "This pandemic has changes our lives a lot. Almost everything is done ...",
          linked: "/pages/self-care/article2",
          link: "/pages/self-care#covid",
          type: "covid",
           styling: {
            color: '#3f83f8'
          },
          class: "bx bxs-virus"
        }
      ]
    },
    computed: {
      filterGoals: function () {
        return this.goals.filter(x => !x.completed).sort((a, b) => a.urgency > b.urgency);
      }
    },
    mounted:function(){
        this.newQuote() 
  },
    methods: {
      newQuote: function(){
        this.random = Math.floor(Math.random() * 5) + 0
        this.quote = this.quotes[this.random];
        this.person = this.persons[this.random];
   }
    }
  });
})();

Vue.component('card', {
  template: `<div class="arts">
     <!-- stuff over here -->
     ng
  </div>`
});

