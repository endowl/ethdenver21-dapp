export const template = `Dear {{trusted-person.name| redactedOrBold }},

This letter describes the insurance policies that I receive through an employment cooperative that I'm a member of to called [Opolis](https://opolis.co/).

{% if benefits.short-term-disability %}
## Short term disability
I have a short term disability policy that covers {{ benefits.short-term-disability.percentage | times: 100 | append: "%"| redactedOrBold }} of my salary starting {{ benefits.short-term-disability.startdays | redactedOrBold }} days after I become disabled and ending {{benefits.short-term-disability.enddays | redactedOrBold }} days after I become disabled. The insurance company that provide the coverage is {{benefits.short-term-disability.insurer| redactedOrBold }}. The policy number is {{benefits.short-term-disability.policy-number| redactedOrBold }} and the group number is {{benefits.short-term-disability.group-number| redactedOrBold }}. Please contact {{benefits.short-term-disability.claims-agent.name| redactedOrBold }} at {{benefits.short-term-disability.claims-agent.phone| redactedOrBold }} to get these benefits started.
{% endif %}

{% if benefits.long-term-disability %}
## Long term disability
I have a short term disability policy that covers {{ benefits.long-term-disability.percentage | times: 100 | append: "%" | redactedOrBold }} of my salary starting {{ benefits.long-term-disability.startdays | redactedOrBold }} days after I become disabled and ending {{benefits.long-term-disability.enddays | redactedOrBold }} days after I become disabled. The insurance company that provide the coverage is {{benefits.long-term-disability.insurer| redactedOrBold }}. The policy number is {{benefits.long-term-disability.policy-number| redactedOrBold }} and the group number is {{benefits.long-term-disability.group-number| redactedOrBold }}. Please contact {{benefits.long-term-disability.claims-agent.name| redactedOrBold }} at {{benefits.long-term-disability.claims-agent.phone| redactedOrBold }} to get these benefits started.
{% endif %}

{% if benefits.term-life && member.isDeceased %}
## Life Insurance
I have a life insurance policy that covers in the amount of {{benefits.term-life.amount | money | redactedOrBold }}. {{benefits.term-life.beneficary.name| redactedOrBold }} has been designated as my beneficiary. The insurance company that provides the coverage is {{benefits.term-life.insurer| redactedOrBold }}. The policy number is {{benefits.term-life.policy-number| redactedOrBold }}. Please help {{benefits.term-life.beneficary.name| redactedOrBold }} contact {{benefits.term-life.claims-agent.name| redactedOrBold }} at {{benefits.term-life.claims-agent.phone| redactedOrBold }} to claim this benefits.
{% endif %}

{% if member.isDeceased %}
Opolis should already have been notified that I have passed away. Please call them to confirm that they have cancelled all of my benefits and that they have updated my account in their system. 
{% if wallet.device %}If they need for you to provide a digital signature, my ethereum key is stored on the {{wallet.device.name| redactedOrBold}} that I keep in {{wallet.device.location| redactedOrBold}}. The access PIN for my wallet is {{wallet.device.pin| redactedOrBold}}. 
{% if wallet.private-key %}If that fails, you can recover my Ethereum private key to anther wallet. It is {{wallet.private-key| redactedOrBold}}.{% endif %}{% endif %}
{% endif %}

If you have any questions about any this information or issues claiming my insurance benefits, please contact {{opolis.contact.name| redactedOrBold }} at {{opolis.contact.phone| redactedOrBold }}. My Opolis membership is id {{member.id| redactedOrBold }}.

With sincere gratitude,

{{member.name| redactedOrBold }}
`