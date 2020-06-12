module Jekyll
  class RenderEquationBlock < Liquid::Block

    def render(context)
      text = super

      output = """
<div class=\"equation\">
  \\begin{equation}
    #{text}
  \\end{equation}
</div>
      """

      return output
    end

  end
end

Liquid::Template.register_tag('equation', Jekyll::RenderEquationBlock)
