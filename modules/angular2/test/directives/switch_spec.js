import {describe, xit, it, expect, beforeEach, ddescribe, iit, el} from 'angular2/test_lib';
import {DOM} from 'angular2/src/facade/dom';
import {Injector} from 'angular2/di';
import {Lexer, Parser, dynamicChangeDetection} from 'angular2/change_detection';
import {Compiler, CompilerCache} from 'angular2/src/core/compiler/compiler';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';
import {NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {Component} from 'angular2/src/core/annotations/annotations';
import {TemplateConfig} from 'angular2/src/core/annotations/template_config';
import {Switch, SwitchWhen, SwitchDefault} from 'angular2/src/directives/switch';

export function main() {
  describe('switch', () => {
    var view, cd, compiler, component;
    beforeEach(() => {
      compiler = new Compiler(dynamicChangeDetection, null, new DirectiveMetadataReader(),
        new Parser(new Lexer()), new CompilerCache(), new NativeShadowDomStrategy());
    });

    function createView(pv) {
      component = new TestComponent();
      view = pv.instantiate(null);
      view.hydrate(new Injector([]), null, component);
      cd = view.changeDetector;
    }

    function compileWithTemplate(template) {
      return compiler.compile(TestComponent, el(template));
    }

    describe('switch value changes', () => {
      it('should switch amongst when values', (done) => {
        var template = '<div>' +
          '<ul [switch]="switchValue">' +
            '<template [switch-when]="\'a\'"><li>when a</li></template>' +
            '<template [switch-when]="\'b\'"><li>when b</li></template>' +
          '</ul></div>';
        compileWithTemplate(template).then((pv) => {
          createView(pv);
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('');

          component.switchValue = 'a';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when a');

          component.switchValue = 'b';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when b');

          done();
        });
      });

      it('should switch amongst when values with fallback to default', (done) => {
        var template = '<div>' +
          '<ul [switch]="switchValue">' +
            '<li template="switch-when \'a\'">when a</li>' +
            '<li template="switch-default">when default</li>' +
          '</ul></div>';
        compileWithTemplate(template).then((pv) => {
          createView(pv);
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when default');

          component.switchValue = 'a';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when a');

          component.switchValue = 'b';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when default');

          done();
        });
      });

      it('should support multiple whens with the same value', (done) => {
        var template = '<div>' +
          '<ul [switch]="switchValue">' +
            '<template [switch-when]="\'a\'"><li>when a1;</li></template>' +
            '<template [switch-when]="\'b\'"><li>when b1;</li></template>' +
            '<template [switch-when]="\'a\'"><li>when a2;</li></template>' +
            '<template [switch-when]="\'b\'"><li>when b2;</li></template>' +
            '<template [switch-default]><li>when default1;</li></template>' +
            '<template [switch-default]><li>when default2;</li></template>' +
          '</ul></div>';
        compileWithTemplate(template).then((pv) => {
          createView(pv);
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when default1;when default2;');

          component.switchValue = 'a';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when a1;when a2;');

          component.switchValue = 'b';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when b1;when b2;');

          done();
        });
      });
    });

    describe('when values changes', () => {
      it('should switch amongst when values', (done) => {
        var template = '<div>' +
          '<ul [switch]="switchValue">' +
            '<template [switch-when]="when1"><li>when 1;</li></template>' +
            '<template [switch-when]="when2"><li>when 2;</li></template>' +
            '<template [switch-default]><li>when default;</li></template>' +
          '</ul></div>';
        compileWithTemplate(template).then((pv) => {
          createView(pv);

          component.when1 = 'a';
          component.when2 = 'b';
          component.switchValue = 'a';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when 1;');

          component.switchValue = 'b';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when 2;');

          component.switchValue = 'c';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when default;');

          component.when1 = 'c';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when 1;');

          component.when1 = 'd';
          cd.detectChanges();
          expect(DOM.getText(view.nodes[0])).toEqual('when default;');

          done();
        });
      });
    });
  });
}

@Component({
  selector: 'test-cmp',
  template: new TemplateConfig({
    inline: '',  // each test swaps with a custom template.
    directives: [Switch, SwitchWhen, SwitchDefault]
  })
})
class TestComponent {
  switchValue: any;
  when1: any;
  when2: any;

  constructor() {
    this.switchValue = null;
    this.when1 = null;
    this.when2 = null;
  }
}
