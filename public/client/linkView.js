Shortly.LinkView = Backbone.View.extend({
  className: 'link',

  template: Handlebars.compile([
    '<img src="/redirect_icon.png"/>',
    '<div class="info">',
      '<div class="visits"><span class="count">{{visits}}</span>Visits</div>',
      '<div class="title">{{title}}</div>',
      '<div class="original">{{url}}</div>',
      '<a href="{{base_url}}/{{code}}">{{base_url}}/{{code}}</a>',
    '</div>'
  ].join('')),

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});
