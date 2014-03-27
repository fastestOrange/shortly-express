Shortly.Router = Backbone.Router.extend({
  initialize: function(options){
    this.$el = options.el;
  },

  routes: {
    '':       'index',
    'links':       'index',
    'create': 'create',
    'login': 'login',
    'signup': 'signup',
    'logout': 'logout'
  },

  swapView: function(view){
    this.$el.html(view.render().el);
  },

  index: function(){
    console.log('index view');
    var links = new Shortly.Links();
    var linksView = new Shortly.LinksView({ collection: links });
    linksView.on('needLogin', function(){
      this.login();
    }, this);
    this.swapView(linksView);
  },

  create: function(){
    $.ajax({
      method: 'POST',
      url: '/isLoggedIn',
      context: this,
      success: function(){
        this.swapView(new Shortly.createLinkView());
      },
      error: function(){
        this.login();
      }
    });

  },

  login: function(){
    this.swapView(new Shortly.LoginView());
  },

  logout: function(){
    console.log('logging out');
    $.ajax({
      method: 'POST',
      url: '/logout',
      context: this,
      success: function(){
        this.login();
      }
    });
  }
});
