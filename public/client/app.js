window.Shortly = Backbone.View.extend({
  template: Handlebars.compile([
    '<div class="navigation">',
      '<ul>',
      '<li><a href="#" class="index">All Links</a></li>',
      '<li><a href="#" class="create">Shorten</a></li>',
      '<li><a href="#" class="logout">Logout</a></li>',
     '</ul>',
    '</div>',
    '<div id="container"></div>'
  ].join('')),

  events: {
    'click li a.index':  'renderIndexView',
    'click li a.create': 'renderCreateView',
    'click li a.logout': 'logout'
  },

  initialize: function(){
    console.log( 'Shortly is running' );
    $('body').append(this.render().el);

    this.router = new Shortly.Router({ el: this.$el.find('#container') });
    this.router.on('route', this.updateNav, this);
    Backbone.history.start({ pushState: true });
    //this.renderIndexView();
  },

  render: function(){
    this.$el.html( this.template() );
    return this;
  },

  renderIndexView: function(e){
    console.log('render index view');
    e && e.preventDefault();
    this.router.navigate('/links', { trigger: true });
  },

  renderCreateView: function(e){
    e && e.preventDefault();
    this.router.navigate('/create', { trigger: true });
  },

  updateNav: function(routeName){
    this.$el.find('.navigation li a')
      .removeClass('selected')
      .filter('.' + routeName)
      .addClass('selected');
  },

  logout: function(e){
    e && e.preventDefault();
    this.router.navigate('/logout', { trigger: true });
  }
});
