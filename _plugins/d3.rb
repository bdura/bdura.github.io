module Jekyll
  class RenderD3Block < Liquid::Block

     def initialize(tag_name, input, tokens)
        super
        @iden = input
     end

    def render(context)
      text = super

      output = """
<div class=\"d3\" id=\"#{@iden}\"></div>
<script>
  #{text}
</script>
      """

      return output
    end

  end
end

Liquid::Template.register_tag('d3', Jekyll::RenderD3Block)
